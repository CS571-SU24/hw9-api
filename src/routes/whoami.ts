import { Express } from 'express';

import { CS571Route } from "@cs571/su24-api-framework/src/interfaces/route";
import { CS571HW9DbConnector } from '../services/hw9-db-connector';
import { CS571HW9TokenAgent } from '../services/hw9-token-agent';

export class CS571WhoAmIRoute implements CS571Route {

    public static readonly ROUTE_NAME: string = '/rest/su24/hw9/whoami';

    private readonly connector: CS571HW9DbConnector;
    private readonly tokenAgent: CS571HW9TokenAgent;

    public constructor(connector: CS571HW9DbConnector, tokenAgent: CS571HW9TokenAgent) {
        this.connector = connector;
        this.tokenAgent = tokenAgent;
    }

    public addRoute(app: Express): void {
        app.get(CS571WhoAmIRoute.ROUTE_NAME, async (req, res) => {
            const user = await this.tokenAgent.validateToken(req.header('Authorization')?.split(" ")[1] ?? "");
            res.status(200).send({
                isLoggedIn: user ? req.header('Authorization')?.startsWith("Bearer") : false,
                user: user
            })
        })
    }

    public getRouteName(): string {
        return CS571WhoAmIRoute.ROUTE_NAME;
    }
}
