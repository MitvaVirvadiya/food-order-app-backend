import { Request, Response } from "express";
import Stripe from "stripe";
import { Restaurant, menuItemTypes } from "../models/restaurant.model";
import { Order } from "../models/order.model";

const STRIPE = new Stripe(process.env.STRIPE_API_KEY as string);
const FRONTEND_URL = process.env.FRONTEND_URL as string;
const WEBHOOK_SECRET_KEY = process.env.STRIPE_WEBHOOK_SECRET_KEY as string;

type CheckoutSessionRequest = {
  cartItems: {
    menuItemId: string;
    name: string;
    quantity: string;
  }[];
  deliveryDetails: {
    email: string;
    name: string;
    address: string;
    city: string;
  };
  restaurantId: string;
};

const getOrders = async (req: Request, res: Response) => {
  try {
    const orders = await Order.find({ user: req.userId })
      .populate("restaurant")
      .populate("user");

    if (!orders) {
      return res.status(404).json({ message: "Orders not found" });
    }

    res.json(orders);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error while fetching orders" });
  }
};

const stripeWebhookHandler = async (req: Request, res: Response) => {
  let event;
  try {
    const sig = req.headers["stripe-signature"];
    event = STRIPE.webhooks.constructEvent(
      req.body,
      sig as string,
      WEBHOOK_SECRET_KEY
    );
  } catch (error: any) {
    console.log(error);
    return res.status(400).send(`Webhook error: ${error.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const order = await Order.findById(event.data.object.metadata?.orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.totalAmount = event.data.object.amount_total;
    order.status = "paid";

    await order.save();
  }
  res.status(200).send();
};

const createCheckoutSession = async (req: Request, res: Response) => {
  try {
    const checkoutSessionRequest: CheckoutSessionRequest = req.body;

    const restaurant = await Restaurant.findById(
      checkoutSessionRequest.restaurantId
    );
    if (!restaurant) {
      throw new Error("Restaurant not found");
    }

    const order = new Order({
      restaurant: restaurant,
      user: req.userId,
      status: "placed",
      deliveryDetails: checkoutSessionRequest.deliveryDetails,
      cartItems: checkoutSessionRequest.cartItems,
      createdAt: new Date(),
    });

    const lineItem = createLineItem(
      checkoutSessionRequest,
      restaurant.menuItems
    );

    const session = await createSession(
      lineItem,
      order._id.toString(),
      restaurant.deliveryPrice,
      restaurant._id.toString()
    );

    if (!session.url) {
      return res.status(500).json({ message: "Error creating stripe session" });
    }

    await order.save();
    return res.json({ url: session.url }); // Return the session URL
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ message: error.raw.message });
  }
};

const createLineItem = (
  checkoutSessionRequest: CheckoutSessionRequest,
  menuItems: menuItemTypes[]
) => {
  const lineItem = checkoutSessionRequest.cartItems.map((cartItem) => {
    const menuItem = menuItems.find(
      (item) => item._id.toString() === cartItem.menuItemId.toString()
    );

    if (!menuItem) {
      throw new Error(`Menu item not found: ${cartItem.menuItemId}`);
    }

    const line_item: Stripe.Checkout.SessionCreateParams.LineItem = {
      price_data: {
        currency: "inr",
        unit_amount: menuItem.price,
        product_data: {
          name: menuItem.name,
        },
      },
      quantity: parseInt(cartItem.quantity),
    };

    return line_item;
  });
  return lineItem;
};

const createSession = async (
  lineItem: Stripe.Checkout.SessionCreateParams.LineItem[],
  orderId: string,
  deliveryPrice: number,
  restaurantId: string
) => {
  const sessionData = await STRIPE.checkout.sessions.create({
    line_items: lineItem,
    shipping_options: [
      {
        shipping_rate_data: {
          display_name: "Delivery",
          type: "fixed_amount",
          fixed_amount: {
            amount: deliveryPrice,
            currency: "inr",
          },
        },
      },
    ],
    mode: "payment",
    metadata: {
      orderId,
      restaurantId,
    },
    success_url: `${FRONTEND_URL}/order-status?success=true`,
    cancel_url: `${FRONTEND_URL}/restaurant/${restaurantId}?cancelled=true`,
  });
  return sessionData;
};

export { createCheckoutSession, stripeWebhookHandler, getOrders };
