import { Express } from 'express';

import { CS571Route } from "@cs571/su24-api-framework/src/interfaces/route";
import { CS571HW9DbConnector } from '../services/hw9-db-connector';

export class CS571GetMessagesRoute implements CS571Route {

    public static readonly ROUTE_NAME: string = '/rest/su24/hw9/messages';

    private readonly connector: CS571HW9DbConnector;
    private readonly chatrooms: string[];

    public constructor(chatrooms: string[], connector: CS571HW9DbConnector) {
        this.chatrooms = chatrooms;
        this.connector = connector;
    }

    public addRoute(app: Express): void {
        app.get(CS571GetMessagesRoute.ROUTE_NAME, async (req, res) => {
            const chatroom = req.query.chatroom as string;
            if (!this.chatrooms.includes(chatroom)) {
                res.status(404).send({
                    msg: "The specified chatroom does not exist. Chatroom names are case-sensitive."
                });
                return;
            }

            const messages = await this.connector.getMessages(chatroom);

            res.status(200).send({
                msg: "Successfully got the latest messages!",
                messages: messages.slice(0, 100)
            });
        })
    }

    public getRouteName(): string {
        return CS571GetMessagesRoute.ROUTE_NAME;
    }
}
