export declare class AiController {
    private matchCache;
    private cacheTime;
    private getAllMatches;
    chat(body: {
        message: string;
        history?: {
            role: string;
            content: string;
        }[];
    }): Promise<{
        reply: any;
    }>;
}
