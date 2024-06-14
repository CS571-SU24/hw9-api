import { Express } from 'express';

import { CS571Route } from "@cs571/su24-api-framework/src/interfaces/route";
import { CS571HW9DbConnector } from '../services/hw9-db-connector';
import { BadgerUserRegistration } from '../model/badger-user-registration';
import { CS571HW9TokenAgent } from '../services/hw9-token-agent';
import { CS571Config } from '@cs571/su24-api-framework';
import HW9PublicConfig from '../model/configs/hw9-public-config';
import HW9SecretConfig from '../model/configs/hw9-secret-config';

export class CS571RegisterRoute implements CS571Route {

    public static readonly ROUTE_NAME: string = '/rest/su24/hw9/register';

    private readonly connector: CS571HW9DbConnector;
    private readonly tokenAgent: CS571HW9TokenAgent;
    private readonly config: CS571Config<HW9PublicConfig, HW9SecretConfig>


    public constructor(connector: CS571HW9DbConnector, tokenAgent: CS571HW9TokenAgent, config: CS571Config<HW9PublicConfig, HW9SecretConfig>) {
        this.connector = connector;
        this.tokenAgent = tokenAgent;
        this.config = config;
    }

    public addRoute(app: Express): void {
        app.post(CS571RegisterRoute.ROUTE_NAME, async (req, res) => {
            const username = req.body.username?.trim();
            const pin = req.body.pin?.trim();

            if (!username || !pin) {
                res.status(400).send({
                    msg:  "A request must contain a 'username' and 'pin'"
                });
                return;
            }

            if (!/^\d{7}$/.test(pin)) {
                res.status(400).send({
                    msg:  "A pin must exactly be a 7-digit PIN code passed as a string."
                });
                return;
            }

            if (username.length > 64) {
                res.status(413).send({
                    msg: "'username' must be 64 characters or fewer"
                });
                return;
            }

            const alreadyExists = await this.connector.findUserIfExists(username);

            if (alreadyExists) {
                res.status(409).send({
                    msg: "The user already exists!"
                });
                return;
            }

            const badgerUser = await this.connector.createBadgerUser(new BadgerUserRegistration(username, pin, req.header("X-CS571-ID") as string));
            const cook = this.tokenAgent.generateAccessToken(badgerUser);

            res.status(200).send(
                {
                    msg: "Successfully authenticated.",
                    user: badgerUser,
                    token: cook,
                    eat: this.tokenAgent.getExpFromToken(cook)
                }
            );
        })
    }

    public getRouteName(): string {
        return CS571RegisterRoute.ROUTE_NAME;
    }
}
