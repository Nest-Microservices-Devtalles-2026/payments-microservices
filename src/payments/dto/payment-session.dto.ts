import { Type } from "class-transformer";
import { ArrayMinSize, IsArray, IsNumber, IsPositive, IsString, ValidateNested } from "class-validator";

export class PaymentSessionDto {

    @IsString()
    orderId!: string;

    @IsString()
    currency!: string;

    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true }) // esto indica que cada elemento del array pasa por las validaciones PaymentSessionItemDto
    @Type(() => PaymentSessionItemDto)
    items!: PaymentSessionItemDto[];
}

export class PaymentSessionItemDto {
    @IsString()
    name!: string;

    @IsNumber()
    @IsPositive()
    price!: number;

    @IsNumber()
    @IsPositive()
    quantity!: number;
}