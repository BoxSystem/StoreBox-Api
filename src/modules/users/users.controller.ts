import {
    Controller, Get, Post, Body, Res, HttpStatus, Req, BadRequestException,
    Param, UseGuards, Query, Delete
} from "@nestjs/common";
import {
    ApiBearerAuth, ApiUseTags, ApiResponse, ApiOperation, ApiImplicitParam
} from "@nestjs/swagger";
import { Model as UserModel, IUser, UserDoc } from "@models/User";
import { CreateUserDto, ModifyPasswordDto, CommonUserDot } from "./users.dto";
import { Roles } from "../common/decorators/roles.decorator";
import { RolesGuard } from "../common/guards/roles.guard";
import { PerPageDto, ListResponse } from "../common/dtos/page.dto";
import { ParseIntPipe } from "../common/pipes/parse-int.pipe";

@UseGuards(RolesGuard)
@Controller("api/v1/users")
// region Swagger Docs
@ApiUseTags("users")
@ApiBearerAuth()
// endregion Swagger Docs
export class UsersController {

    @Roles("admin")
    @Get()
    // region Swagger Docs
    @ApiOperation({ title: "Get User List" })
    @ApiResponse({
        status: HttpStatus.OK, description: "User List",
        type: ListResponse
    })
    // endregion Swagger Docs
    public async findAll(@Query(new ParseIntPipe()) query: PerPageDto) {
        const curPage = query.page || 1;
        const totalPage = await UserModel.pageCount(query.perNum);
        const data = new ListResponse<IUser | UserDoc>();
        data.current = curPage;
        data.total = totalPage;
        if (totalPage >= (query.page || 1)) {
            data.data = await UserModel.list(query.perNum, query.page);
        }
        return data;
    }

    @Roles("admin")
    @Post()
    // region Swagger Docs
    @ApiOperation({ title: "Add User" })
    @ApiResponse({ status: HttpStatus.CREATED, description: "Add Success" })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Add Fail" })
    // endregion Swagger Docs
    public async addUser(@Res() res, @Body() user: CreateUserDto) {
        try {
            await UserModel.addUser(user.username, user.password);
        } catch (error) {
            throw new BadRequestException(error.toString());
        }
        res.status(HttpStatus.CREATED).json({ });
    }

    @Roles("admin")
    @Post("/:id/password")
    // region Swagger Docs
    @ApiOperation({ title: "Modify User Password" })
    @ApiImplicitParam({ name: "id", description: "User ID" })
    @ApiResponse({ status: HttpStatus.OK, description: "Modify Success" })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Modify Fail" })
    // endregion Swagger Docs
    public async password(
        @Res() res, @Body() user: ModifyPasswordDto, @Param("id") id
    ) {
        try {
            await UserModel.passwd(id, user.oldPassword, user.newPassword);
        } catch (error) {
            throw new BadRequestException(error.toString());
        }
        res.status(HttpStatus.OK).send();
    }

    @Roles("admin")
    @Delete("/:id")
    // region Swagger Docs
    @ApiOperation({ title: "Delete User" })
    @ApiImplicitParam({ name: "id", description: "User ID" })
    @ApiResponse({ status: HttpStatus.OK, description: "Delete Success" })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Delete Fail" })
    // endregion Swagger Docs
    public deleteByDelete(@Param() user: CommonUserDot) {
        return this.delete(user);
    }

    @Roles("admin")
    @Get("/:id/delete")
    // region Swagger Docs
    @ApiOperation({ title: "Delete User" })
    @ApiImplicitParam({ name: "id", description: "User ID" })
    @ApiResponse({ status: HttpStatus.OK, description: "Delete Success" })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Delete Fail" })
    // endregion Swagger Docs
    public async delete(@Param() user: CommonUserDot) {
        try {
            await UserModel.removeUser(user.id);
        } catch (error) {
            throw new BadRequestException(error.toString());
        }
        return { };
    }

    @Roles("admin")
    @Get("/:id/ban")
    // region Swagger Docs
    @ApiOperation({ title: "Ban User" })
    @ApiImplicitParam({ name: "id", description: "User ID" })
    @ApiResponse({ status: HttpStatus.OK, description: "Ban Success" })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Ban Fail" })
    // endregion Swagger Docs
    public async ban(@Res() res, @Param() user: CommonUserDot) {
        try {
            await UserModel.ban(user.id);
        } catch (error) {
            throw new BadRequestException(error.toString());
        }
        res.status(HttpStatus.OK).json({ });
    }

    @Roles("admin")
    @Get("/:id/allow")
    // region Swagger Docs
    @ApiOperation({ title: "Allow User" })
    @ApiImplicitParam({ name: "id", description: "User ID" })
    @ApiResponse({ status: HttpStatus.OK, description: "Allow Success" })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Allow Fail" })
    // endregion Swagger Docs
    public async allow(@Res() res, @Param() user: CommonUserDot) {
        try {
            await UserModel.allow(user.id);
        } catch (error) {
            throw new BadRequestException(error.toString());
        }
        res.status(HttpStatus.OK).json({ });
    }
}
