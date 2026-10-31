// دریافت ابزارهای مربوط به Request و Response در Next.js
import { NextRequest, NextResponse } from "next/server";

// تابع اتصال به دیتابیس
import connectDb from "@/utils/connectDb";

// وارد کردن Cloudinary برای آپلود تصاویر
import { v2 as cloudinary } from "cloudinary";

// وارد کردن مدل Event برای ذخیره اطلاعات
import Event from "@/models/Event.model";

// تعریف Route Handler برای درخواست POST
export async function POST(request: NextRequest) {

    try {
        // اتصال به دیتابیس MongoDB
        await connectDb();

        // دریافت اطلاعات ارسالی به شکل FormData
        const formData = await request.formData();

        // تعریف متغیر برای نگهداری اطلاعات Event
        let event;

        try {
            // تبدیل FormData به یک آبجکت معمولی
            event = Object.fromEntries(formData);

        } catch (error) {
            // ارسال پاسخ خطا در صورت شکست تبدیل
            return NextResponse.json(
                { message: "Invalid Json Data Format!" },
                { status: 400 }
            );
        }

        // دریافت فایل تصویر از FormData
        const file = formData.get("image") as File;

        // بررسی وجود فایل تصویر
        if (!file) {
            return NextResponse.json(
                { message: "Image File is Required!" },
                { status: 400 }
            );
        }

        // تبدیل رشته JSON مربوط به tags به Array
        let tags = JSON.parse(formData.get("tags") as string);

        // تبدیل رشته JSON مربوط به agenda به Array
        let agenda = JSON.parse(formData.get("agenda") as string);

        // تبدیل فایل تصویر به ArrayBuffer
        const arrayBuffer = await file.arrayBuffer();

        // تبدیل ArrayBuffer به Buffer مخصوص Node.js
        const buffer = Buffer.from(arrayBuffer);

        // ایجاد Promise برای مدیریت آپلود Cloudinary
        const uploadResult = await new Promise((resolve, reject) => {

            // شروع آپلود تصویر در Cloudinary
            cloudinary.uploader.upload_stream(
                {
                    // تعیین نوع فایل به عنوان تصویر
                    resource_type: "image",

                    // تعیین پوشه ذخیره تصویر
                    folder: "events",

                },
                // دریافت نتیجه یا خطای آپلود
                (error, result) => {

                    // در صورت وجود خطا Promise را Reject کن
                    if (error) {
                        return reject(error);
                    }

                    // در صورت موفقیت نتیجه را برگردان
                    resolve(result);
                }

            // ارسال Buffer تصویر به Stream آپلود
            ).end(buffer);
        });

        // دریافت URL امن تصویر و افزودن آن به Event
        event.image = (uploadResult as { secure_url: string }).secure_url;

        // ایجاد Event جدید و ذخیره آن در MongoDB
        const createdEvent = await Event.create({
            ...event,
            tags,
            agenda
        });

        // ارسال پاسخ موفقیت‌آمیز با وضعیت 201
        return NextResponse.json(
            {
                message: "Event created successfully",
                event: createdEvent
            },
            { status: 201 }
        );

    } catch (error) {

        // نمایش جزئیات خطا در ترمینال سرور
        console.error(error);

        // ارسال پاسخ خطای داخلی سرور
        return NextResponse.json(
            { message: "Something went wrong" },
            { status: 500 }
        );
    }
}


export async function GET() {
  try {
    await connectDb();
    const events = await Event.find().sort({ createdAt: -1 });
    return NextResponse.json({ events }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Event fetching failed", error },
      { status: 500 },
    );
  }
}