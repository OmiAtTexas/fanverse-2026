export declare class AiController {
    private matchCache;
    private cacheTime;
    private getAllMatches;
    chat(body: {
        message: string;
    }): Promise<{
        reply: any;
    }>;
}
