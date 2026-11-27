"use client";
import { useEffect, useState, type ImgHTMLAttributes } from "react";
import { platformClient } from "@/lib/platform/client";

export default function LeagueImage({ src, unoptimized, ...props }: ImgHTMLAttributes<HTMLImageElement> & { unoptimized?: boolean }) {
    void unoptimized;
    const prefix = process.env.NEXT_PUBLIC_SUPABASE_URL + "/storage/v1/object/authenticated/league-images/";
    const path = typeof src === "string" && src.startsWith(prefix) ? src.slice(prefix.length) : null;
    const [resolved, setResolved] = useState<{ path: string; url: string } | null>(null);
    useEffect(() => {
        if (!path) return;
        const controller = new AbortController();
        let active = true;
        let localUrl: string | undefined;
        void platformClient().storage.from("league-images").download(path, {}, { cache: "no-store", signal: controller.signal }).then(({ data }) => {
            if (!active || !data) return;
            localUrl = URL.createObjectURL(data);
            setResolved({ path, url: localUrl });
        }).catch(() => { /* Leave an inaccessible or removed image hidden. */ });
        return () => {
            active = false;
            controller.abort();
            if (localUrl) URL.revokeObjectURL(localUrl);
        };
    }, [path]);
    const display = path ? (resolved?.path === path ? resolved.url : undefined) : src;
    return display ? <img {...props} src={display} alt={props.alt ?? ""}/> : null;
}
