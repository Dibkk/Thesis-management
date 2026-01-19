// app/api/query/thesis/route.ts
<<<<<<< HEAD
import { NextResponse } from "next/server";
import { connectDatabase } from "@/lib/databaseconnect";
import { Thesis } from "@/lib/models/Thesis";
import { User } from "@/lib/models/Users";
=======
import { NextResponse } from 'next/server';
import { connectDatabase } from '@/lib/databaseconnect';
<<<<<<< HEAD
// We'll dynamically import models after connecting to ensure their schemas
// are registered on the active mongoose instance used by `connectDatabase()`.
>>>>>>> cfe90daa1880b2eccd992a5de8be2d5fecf36ca7
=======
import { Thesis } from '@/lib/models/Thesis';
import { User } from '@/lib/models/Users';
>>>>>>> 187d65235fd4ddd91e03c91193950c276a77d2da

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectDatabase();

<<<<<<< HEAD
<<<<<<< HEAD
    const Theses = await Thesis.find({ status: "approved", isPublic: "true" })
      .populate({ path: "author", select: "firstName lastName", model: User })
      .populate({ path: "advisor", select: "firstName lastName", model: User })
      .sort({ createdAt: -1 });
=======
    // Ensure models are loaded and registered with mongoose used by connectDatabase()
    const { Thesis } = await import('@/lib/models/Thesis');
    await import('@/lib/models/Users');

    const Theses = await Thesis.find({ status: 'approved', isPublic: true })
      .populate('author', 'firstName lastName')
      .populate('advisor', 'firstName lastName')
      .sort({ createdAt: -1 })
      .exec();
>>>>>>> cfe90daa1880b2eccd992a5de8be2d5fecf36ca7
=======
    const Theses = await Thesis.find({ status: 'approved', isPublic:'true' })
      .populate('author', 'firstName lastName')
      .populate('advisor', 'firstName lastName')
      .sort({ createdAt: -1 });
>>>>>>> 187d65235fd4ddd91e03c91193950c276a77d2da

    return NextResponse.json({ success: true, theses: Theses });
  } catch (error: any) {
    console.error("Query Thesis Error:", error);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}
