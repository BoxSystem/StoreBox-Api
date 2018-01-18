import {
    Controller, Get, Param, Req, Res, BadRequestException,
    NotFoundException, UseGuards
} from "@nestjs/common";
import { ApiUseTags, ApiImplicitParam, ApiOperation } from "@nestjs/swagger";
import { Model as GoodsModels, GoodDoc } from "@models/Good";
import { config } from "@utils/config";

import { Response } from "express";
import pathExists = require("path-exists");
import fs = require("fs-extra");

import { DownlaodDto } from "./files.dto";
import { Roles } from "../common/decorators/roles.decorator";
import { RolesGuard } from "../common/guards/roles.guard";

(async () => {
    if (!(await pathExists(config.paths.upload))) {
        fs.mkdirp(config.paths.upload);
    }
})();

@UseGuards(RolesGuard)
@ApiUseTags("files")
@Controller("files")
export class FilesController {

    @Roles("guest")
    @Get("/categories/:cid/goods/:id")
    @ApiOperation({ title: "Download File" })
    @ApiImplicitParam({ name: "cid", description: "Categroy ID" })
    @ApiImplicitParam({ name: "id", description: "Good ID" })
    public async downloadFile(
        @Req() req, @Res() res: Response, @Param() params: DownlaodDto
    ) {
        let obj: GoodDoc;
        try {
            obj = await GoodsModels
                .findOne({_id: params.id, categroy: params.cid})
                .exec();
        } catch (error) {
            throw new BadRequestException(error.toString());
        }
        if (!obj) {
            throw new NotFoundException();
        }

        const good = obj.toObject();
        const filepath =
            `${config.paths.upload}/${params.cid}/${good.filename}`;

        if (!good.active) {
            throw new BadRequestException("Disallow download the File");
        }
        res.download(filepath, good.originname, (err) => {
            if (err) {
                // Recode Error
            }
        });
    }
}
