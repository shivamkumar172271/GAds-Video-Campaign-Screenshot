import { NextResponse } from "next/server";

export async function GET(req) {

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    const API_KEY = process.env.YOUTUBE_API_KEY;

    const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${id}&key=${API_KEY}`;

    const res = await fetch(url);
    const data = await res.json();

    return NextResponse.json(data);

}