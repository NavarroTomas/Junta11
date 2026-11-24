/** Only known internal destinations may be used after login. */
export function loginDestination(next: string | null, hasDraft: boolean): string {
    if (next && (/^\/panel\/[0-9a-f-]{36}$/i.test(next) || ["/mis-ligas", "/crear-liga"].includes(next))) return next;
    return hasDraft ? "/crear-liga" : "/mis-ligas";
}
