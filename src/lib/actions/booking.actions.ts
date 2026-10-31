"use server";

import { Types } from "mongoose";
import connectDb from "@/utils/connectDb";
import Booking from "@/models/Booking.model";

export const createBooking = async ({
  eventId,
  slug,
  email,
}: {
  eventId: Types.ObjectId;
  slug: string;
  email: string;
}) => {
  try {
    await connectDb();

    await Booking.create({ eventId, slug, email });
    return { success: true };
  } catch (error) {
    console.error("create booking failed", error);
    return { success: false };
  }
};