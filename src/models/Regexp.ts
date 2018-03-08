import { model, SchemaDefinition, Model as M, SchemaTypes } from "mongoose";
import { Base, IDoc, IDocRaw, ObjectId, MODIFY_MOTHODS } from "@models/common";
import { ICategory, FLAG as CF, Model as CM } from "@models/Categroy";
import { DEF_PER_COUNT } from "@dtos/page";
import Cache =  require("schedule-cache");
import isRegExp = require("@utils/isRegExp");

import { INewRegexp } from "../modules/regexps/regexps.dto";

export const cache = Cache.create(`${Date.now()}${Math.random()}`);

const Definition: SchemaDefinition = {
    name: { type: String, required: true, unique: true },
    value: { type: String, required: true },
    link: {
        type: SchemaTypes.ObjectId,
        ref: CF
    },
    hidden: { type: Boolean, default: false }
};

export interface IRegexp extends IDocRaw {
    name: string;
    value: string;
    link: ObjectId | ICategory;
    hidden: boolean;
}

export interface IRegexpsRaw extends IRegexp {
    link: ICategory;
}

export interface IRegexpDoc {
    name: string;
    value: string;
    link?: ObjectId;
    hidden?: boolean;
}

export type RegexpDoc = IDoc<IRegexp>;

const RegexpSchema = new Base(Definition).createSchema();

// region static methods
RegexpSchema.static(
    "addRegexp",
    (name: string, value: string, link?: ObjectId) => {
        const obj: INewRegexp = {
            name: name,
            value: value
        };
        if (link) {
            obj.link = link;
        }
        return Model.create(obj);
    }
);

RegexpSchema.static("removeRegexp", (id: ObjectId) => {
    return Model.findByIdAndRemove(id).exec();
});

// endregion static methods

export const FLAG = "regexps";

interface IRegexpModel<T extends RegexpDoc> extends M<T> {
    /**
     * 创建新规则
     * @return {Promise}
     */
    addRegexp(name: string, value: string, link?: ObjectId): Promise<T>;
    /**
     * 移除规则
     * @return {Promise}
     */
    removeRegexp(id: ObjectId): Promise<T>;
}

// region Validators
RegexpSchema.path("name").validate({
    isAsync: true,
    validator: async (value, respond) => {
        const result = await Model.findOne({ name: value }).exec();
        return respond(!result);
    },
    message: "The name is exist"
});

RegexpSchema.path("value").validate({
    isAsync: true,
    validator: (value, respond) => {
        return respond(isRegExp(value));
    },
    message: "The value isnt Regexp"
});

RegexpSchema.path("value").validate({
    isAsync: true,
    validator: async function ValueExistValidator(value, respond) {
        if (this && this.hidden) {
            return respond(true);
        }
        const result =
            await Model.findOne({ value: value, hidden: false }).exec();
        return respond(!result);
    },
    message: "The value is exist"
});

RegexpSchema.path("link").validate({
    isAsync: true,
    validator: async (value, respond) => {
        const result = await CM.findById(value).exec();
        return respond(!!result);
    },
    message: "The Category ID is not exist"
});

RegexpSchema.path("hidden").validate({
    isAsync: true,
    validator: async function hiddenExistValidator(value, respond) {
        if (!value) { // hidden === false
            return respond(true);
        }
        if (!this.isNew) { // hidden === Old Value
            const id = this.getQuery()._id;
            const col = await Model.findById(id).exec();
            if (col.toObject().hidden === value) {
                return respond(true);
            }
        }
        const result =
            await Model.findOne({ value: this.value, hidden: value }).exec();
        respond(result ? false : true);
    },
    message: "Only one active item with every value"
});
// endregion Validators

for (const method of MODIFY_MOTHODS) {
    RegexpSchema.post(method, () => {
        cache.clear();
    });
}

export const Model = model(FLAG, RegexpSchema) as IRegexpModel<RegexpDoc>;
