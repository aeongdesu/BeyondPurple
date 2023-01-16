// might be unmatch
const match_live = /https\:\/\/video-weaver\.[a-z]{3}[0-9]{2}\.hls\.ttvnw\.net\/v1\/playlist\/[a-zA-Z0-9-_]+\.m3u8/
const match_trigger = /https\:\/\/video-weaver\.[a-z]{3}[0-9]{2}\.hls\.ttvnw\.net\/trigger\/[a-zA-Z0-9-_]+/
const match_segment = /(https\:\/\/[a-z0-9]{13,14}\.cloudfront\.net\/[a-z0-9]{20}_[a-zA-Z0-9_]{4,25}_\d{11}_\d{10}\/chunked\/\d+\.ts)|(https\:\/\/video-edge-[a-z0-9]{6}\.[a-z]{3}[0-9]{2}\.abs\.hls\.ttvnw\.net\/v1\/segment\/[a-zA-Z0-9-_]+\.ts)/g
const match_vod = /https\:\/\/[a-z0-9]{13,14}\.cloudfront\.net\/[a-z0-9]{20}_[a-zA-Z0-9_]{4,25}_\d{11}_\d{10}\/chunked\/index-dvr\.m3u8/
const match_tsuvod = /https\:\/\/tsuvod\.com\/api\/\d{10}\/archive\/[a-z0-9]{20}_[a-zA-Z0-9_]{4,25}_\d{11}_\d{10}\/video\.m3u8/

const stream_segment = async (url: string) => {
    const res = await fetch(url, {
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36"
        }
    })
    const { readable, writable } = new TransformStream()
    try { res.body!.pipeTo(writable) } catch { }
    return new Response(readable, res)
}
const m3u8 = async (url: string) => {
    const m3u = await (await fetch(url, {
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36"
        }
    })).text()
    return new Response(m3u.replace(match_segment, "/?url=$&"), {
        headers: {
            "Content-Type": "application/vnd.apple.mpegurl"
        }
    })
}

export default {
    async fetch(request, env) {
        const url = new URL(request.url).searchParams.get("url")!
        if (match_live.test(url) || match_vod.test(url) || match_tsuvod.test(url)) return await m3u8(url)
        else if (match_trigger.test(url)) return await fetch(url)
        else if (match_segment.test(url)) return await stream_segment(url)
        else return new Response("BeyondPurple에 오신걸 환영합니다!\n\n" +
            "지원하는 링크:\n/?url=https://video-weaver.hkg06.hls.ttvnw.net/v1/playlist/blabla.m3u8\n" +
            "/?url=https://tsuvod.com/api/1234567890/archive/hash0694d4_twitchname_12345678901_1234567890/video.m3u8")
    }
}