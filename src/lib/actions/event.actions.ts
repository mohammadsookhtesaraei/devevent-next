"use server";

import Event from "@/models/Event.model";
import connectDb from "@/utils/connectDb";

export const getSilimarEventsBySlug = async (slug: string) => {
  try {
    await connectDb();
    const event = await Event.findOne({ slug });

    return await Event.find({
      _id: { $ne: event._id },
      tags: { $in: event.tags },
    }).lean();
  } catch (error) {
    return [];
  }
};