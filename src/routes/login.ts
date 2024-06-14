import { Express } from 'express';

import { CS571Route } from "@cs571/su24-api-framework/src/interfaces/route";
import { CS571HW9DbConnector } from '../services/hw9-db-connector';
import { CS571HW9TokenAgent } from '../services/hw9-token-agent';
import { CS571Config } from '@cs571/su24-api-framework';
import HW9PublicConfig from '../model/configs/hw9-public-config';
import HW9SecretConfig from '../model/configs/hw9-secret-config';
import BadgerUser from '../model/badger-user';

export class CS571LoginRoute implements CS571Route {

    public static readonly ROUTE_NAME: string = '/rest/su24/hw9/login';

    private readonly connector: CS571HW9DbConnector;
    private readonly tokenAgent: CS571HW9TokenAgent;
    private readonly config: CS571Config<HW9PublicConfig, HW9SecretConfig>


    public constructor(connector: CS571HW9DbConnector, tokenAgent: CS571HW9TokenAgent, config: CS571Config<HW9PublicConfig, HW9SecretConfig>) {
        this.connector = connector;
        this.tokenAgent = tokenAgent;
        this.config = config;
    }

    public addRoute(app: Express): void {
        app.post(CS571LoginRoute.ROUTE_NAME, async (req, res) => {
            const username = req.body.username?.trim();
            const pin = req.body.pin?.trim();

            if (!username || !pin) {
                res.status(400).send({
                    msg:  "A request must contain a 'username' and 'pin'"
                });
                return;
            }

            const pers = await this.connector.findUserIfExists(username)
            
            if (!pers) {
                // bogus calculation to mirror true hash calculation
                CS571HW9DbConnector.calculateHash(new Date().getTime().toString(), pin)
                this.delayResponse(() => {
                    res.status(401).send({
                        msg: "That username or pin is incorrect!",
                    })
                });
                return;
            }

            const hash = CS571HW9DbConnector.calculateHash(pers.salt, pin)

            if (hash !== pers.pin) {
                this.delayResponse(() => {
                    res.status(401).send({
                        msg: "That username or pin is incorrect!",
                    })
                });
                return;
            }

            const cook = this.tokenAgent.generateAccessToken(new BadgerUser(pers.id, pers.username));

            res.status(200).send({
                msg: "Successfully authenticated.",
                user: {
                    id: pers.id,
                    username: pers.username
                },
                token: cook,
                eat: this.tokenAgent.getExpFromToken(cook)
            })
        })
    }

    public async delayResponse(cb: () => void): Promise<void> {
        return new Promise((resolve: any) => {
            setTimeout(() => {
                cb()
                resolve();
            }, Math.ceil(Math.random() * 100))
        })
        
    }

    public getRouteName(): string {
        return CS571LoginRoute.ROUTE_NAME;
    }
}
