import supertest = require("supertest-session");
import ST = require("supertest");
import { Test } from "@nestjs/testing";
import path = require("path");
import faker = require("faker");
import { Model as UsersModel } from "@models/User";

import { initExpress } from "../../src/express";
import { ApplicationModule } from "../../src/modules/app.module";
import { connect, drop } from "../helpers/database";
import { uploadFile } from "../helpers/files";
import { addCategroyAndRegexp } from "../helpers/categroies";

describe("Goods Api", () => {

    let request: ST.SuperTest<ST.Test>;
    const server = initExpress();

    const user = {
        name: faker.name.firstName(),
        pass: faker.random.words()
    };

    before(async () => {
        connect();
    });

    afterEach(() => {
        return drop();
    });

    before(async () => {
        const module = await Test.createTestingModule({
            modules: [ApplicationModule]
        })
        .compile();
        const app = module.createNestApplication(server);
        await app.init();
        request = supertest(server);
    });

    before(async () => {
        const obj = await UsersModel.addUser(user.name, user.pass);
        const { body: result } = await request.post("/auth/login")
            .send({
                username: user.name, password: user.pass
            }).then();
    });

    beforeEach(async () => {
        await addCategroyAndRegexp(/^icon_.+64x64\.png$/);
    });

    it("Upload File", async () => {
        const filepath = `${__dirname}/../files/icon_pandorabox_64x64.png`;
        let result;
        // Create
        result = await uploadFile(request, filepath);
        result = result.body;

        result.should.have.properties([
            "_id", "originname", "categroy", "uploader"
        ]);
        result.should.have.property("originname", path.basename(filepath));

        // Get
        result = await request.get(`/goods/${result._id}`).then();
        result = result.body;
        result.should.have.properties([
            "_id", "createdAt", "updatedAt",
            "filename", "originname", "attributes", "tags", "active", "hidden",
            "categroy", "uploader"
        ]);
        result.categroy.should.have.properties([
            "_id", "name", "attributes", "tags"
        ]);
        result.uploader.should.have.properties([
            "_id", "username", "nickname"
        ]);
    });

});
