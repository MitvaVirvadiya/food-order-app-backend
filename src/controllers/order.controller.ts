import { Request, Response } from "express";
import Stripe from "stripe";
import { Restaurant, menuItemTypes } from "../models/restaurant.model";

const STRIPE = new Stripe(process.env.STRIPE_API_KEY as string);
const FRONTEND_URL = process.env.FRONTEND_URL as string;

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

const createCheckoutSession = async (req: Request, res: Response) => {
  try {
    const CheckoutSessionRequest: CheckoutSessionRequest = req.body;

    const restaturant = await Restaurant.findById(
      CheckoutSessionRequest.restaurantId
    );
    if (!restaturant) {
      throw new Error("Restaurant not found");
    }

    const lineItem = creatLineItem(
      CheckoutSessionRequest,
      restaturant.menuItems
    );

    const session = await createSession(
      lineItem,
      "TEST_ORDER_ID",
      restaturant.deliveryPrice,
      restaturant._id.toString()
    );

    if(!session.url){
        return res.status(500).json({ message: "Error creating stripe session" });
    }

    res.json({ url: session.url });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ message: error.raw.message });
  }
};

const creatLineItem = (
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

    const list_item: Stripe.Checkout.SessionCreateParams.LineItem = {
      price_data: {
        currency: "inr",
        unit_amount: menuItem.price,
        product_data: {
          name: menuItem.name,
        },
      },
      quantity: parseInt(cartItem.quantity),
    };

    return list_item;
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

export { createCheckoutSession };
