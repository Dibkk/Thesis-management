
import { connectDatabase } from '@/lib/databaseconnect';
import { Download } from "@/lib/models/download";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { user_id, thesis_id } = body;

        if (!user_id || !thesis_id) {
            return NextResponse.json(
                { error: "Missing user_id or thesis_id" },
                { status: 400 }
            );
        }

        await connectDatabase();

        const log = await Download.create({
            user_id,
            thesis_id,
            date: new Date(),
        });

        return NextResponse.json({
            success: true,
            _id: "Goodjob",
        });
    } catch (error) {
        console.error("DOWNLOAD LOG ERROR:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        await connectDatabase();

        const logs = await Download.aggregate([
            // 1) convert string -> ObjectId
            {
                $addFields: {
                    userObjectId: { $toObjectId: '$user_id' },
                    thesisObjectId: { $toObjectId: '$thesis_id' }
                }
            },

            // 2) join user by _id
            {
                $lookup: {
                    from: 'users',
                    localField: 'userObjectId',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            {
                $unwind: {
                    path: '$user',
                    preserveNullAndEmptyArrays: true
                }
            },

            // 3) join thesis by _id
            {
                $lookup: {
                    from: 'theses',
                    localField: 'thesisObjectId',
                    foreignField: '_id',
                    as: 'thesis'
                }
            },
            {
                $unwind: {
                    path: '$thesis',
                    preserveNullAndEmptyArrays: true
                }
            },

            // 4) shape data for frontend
            {
                $project: {
                    _id: 1,
                    date: 1,

                    userFullName: {
                        $cond: [
                            { $ifNull: ['$user', false] },
                            { $concat: ['$user.firstName', ' ', '$user.lastName'] },
                            'Unknown user'
                        ]
                    },

                    thesisId: {
                        $ifNull: ['$thesis.thesis_id', 'Unknown thesis']
                    }
                }
            },

            // 5) latest first
            { $sort: { date: -1 } },
            { $limit: 10 }
        ]);
        console.log("log: ",logs);
        return NextResponse.json(logs);
    } catch (err) {
        console.error(err);
        return NextResponse.json(
            { error: 'Failed to fetch download logs' },
            { status: 500 }
        );
    }
}
