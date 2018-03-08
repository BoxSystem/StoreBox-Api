import supertest = require("supertest");
import faker = require("faker");

import {
    connect, drop, newCategory
} from "../helpers/database";
import { init } from "../helpers/server";
import auth = require("@db/auth");

/**
 * Fix [Issue 27](https://github.com/Arylo/StoreBox/issues/27)
 */
describe("Fix Issues", () => {

    let request: supertest.SuperTest<supertest.Test>;

    before(() => {
        return connect();
    });

    const ids = {
        users: [ ],
        categories: [ ],
        regexps: [ ]
    };

    after(() => {
        return drop(ids);
    });

    before(async () => {
        request = await init();
    });

    describe("Github 27 ", () => {

        before("login", async () => {
            ids.users.push((await auth.login(request))[0]);
        });

        step("Add Category", async () => {
            const doc = await newCategory({ name: faker.random.word() });
            ids.categories.push(doc._id);
        });

        step("Add Regexp and link category", async () => {
            const {
                body: result, status
            } = await request.post("/api/v1/regexps")
                .send({
                    name: faker.random.word() + "link_cate",
                    value: new RegExp("chchachc.+").source,
                    link: ids.categories[0]
                }).then();
            status.should.be.eql(201);
            ids.regexps.push(result._id);
            result.should.have.property("link");
        });

    });
});
