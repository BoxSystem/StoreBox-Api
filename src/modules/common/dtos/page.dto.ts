import { IsIn, IsOptional, IsNumberString } from "class-validator";
import { ApiModelPropertyOptional } from "@nestjs/swagger";

export const PER_COUNT = [ 25, 50, 75 ];

export class PerPageDto {
    @ApiModelPropertyOptional({
        type: Number, default: PER_COUNT[0],
        description: "Display items count per page"
    })
    @IsIn([...PER_COUNT].map((num) => "" + num)) // Because it is NumberString
    @IsNumberString()
    @IsOptional()
    public readonly perNum: number;
    @ApiModelPropertyOptional({
        type: Number, description: "No. page", default: 1
    })
    @IsNumberString()
    @IsOptional()
    public readonly page: number;
}