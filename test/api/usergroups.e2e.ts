import supertest = require("supertest");

import {
    connect, drop, addCategoryAndRegexp
} from "../helpers/database";
import { init } from "../helpers/server";
import { newUsergroup } from "@db/usergroups";
import auth = require("@db/auth");
import { newName, newIds } from "../helpers/utils";

describe("Usergroup E2E Api", () => {

    let request: supertest.SuperTest<supertest.Test>;

    before(() => {
        return connect();
    });

    const ids = newIds();

    after(() => {
        return drop(ids);
    });

    before(async () => {
        request = await init();
    });

    before("login", async () => {
        ids.users.push((await auth.login(request))[0]);
    });

    step("New Usergroup * 2", async () => {
        for (let i = 0; i < 2; i++) {
            const url = `/api/v1/usergroups`;
            const name = newName();
            const { status, body: result } =
                await request.post(url).send({ name }).then();
            status.should.be.eql(201);
            ids.usergroups.push(result._id);
        }
    });

    step("Usergroup List", async () => {
        const url = `/api/v1/usergroups`;
        const { status, body: result } = await request.get(url).then();
        status.should.be.eql(200);
        result.total.should.aboveOrEqual(2);
        result.data.should.be.an.Array();
    });

    step("Get Usergroup Info", async () => {
        const id = ids.usergroups[ids.usergroups.length - 1];
        const url = `/api/v1/usergroups/${id}`;
        const { status, body: result } = await request.get(url).then();
        status.should.be.eql(200);
        result.users.data.should.be.an.Array();
        result.users.total.should.be.eql(0);
    });

    step("Add User into Usergroup", async () => {
        const gid = ids.usergroups[ids.usergroups.length - 1];
        const uid = ids.users[0];
        const url = `/api/v1/usergroups/${gid}/add/${uid}`;
        const { status } = await request.get(url).then();
        status.should.be.eql(201);
    });

    step("Have 1 User", async () => {
        const id = ids.usergroups[ids.usergroups.length - 1];
        const url = `/api/v1/usergroups/${id}`;
        const { status, body: result } = await request.get(url).then();
        status.should.be.eql(200);
        result.users.total.should.be.eql(1);
    });

    step("Fail to Add User into Same Usergroup", async () => {
        const gid = ids.usergroups[ids.usergroups.length - 1];
        const uid = ids.users[0];
        const url = `/api/v1/usergroups/${gid}/add/${uid}`;
        const { status } = await request.get(url).then();
        status.should.be.eql(400);
    });

    step("Modify Usergroup's name", async () => {
        const id = ids.usergroups[ids.usergroups.length - 1];
        const url = `/api/v1/usergroups/${id}`;
        const name = newName();
        const { status } = await request.post(url).send({ name }).then();
        status.should.be.eql(200);
        const { body: result } = await request.get(url).then();
        result.should.have.property("name", name);
    });

    step("Delete By GET", async () => {
        const id = ids.usergroups[ids.usergroups.length - 1];
        const url = `/api/v1/usergroups/${id}/delete`;
        const { status } = await request.get(url).then();
    });

    step("Delete By DELETE", async () => {
        const id = ids.usergroups[ids.usergroups.length - 2];
        const url = `/api/v1/usergroups/${id}`;
        const { status } = await request.delete(url).then();
    });

});
