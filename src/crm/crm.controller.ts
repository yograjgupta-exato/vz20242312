import { BadRequestException, Body, Controller, Get, NotFoundException, Param, Post, Put, Query } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { Tenant } from '../shared/enums';
import { C4CEquipmentAlreadyWarrantedError } from '../shared/errors';
import { ParsePhoneNumberPipe } from '../shared/pipes';
import { CreateCRMServiceRequestCommand } from './commands/create-crm-service-request.command';
import { CRMService } from './crm.service';
import { CRMCompetitorEquipmentDto } from './dtos/crm-competitor-equipment.dto';
import { CRMCustomerDto } from './dtos/crm-customer.dto';
import { CRMEquipmentDto } from './dtos/crm-equipment.dto';
import { CRMWarrantyEquipmentsDto } from './dtos/crm-warranty-equipments.dto';
import { CreateCRMCustomerInput } from './inputs/create-crm-customer.input';
import { RegisterCrmWarrantyEquipmentsInput } from './inputs/register-crm-warranty-equipments.input';

@ApiTags('crms')
@Controller('crms')
export class CRMController {
    constructor(private readonly service: CRMService, private readonly commandBus: CommandBus) {}

    @Get('competitor-equipments')
    @ApiQuery({
        name: 'id',
        description: 'The unique identifier of a competitor equipment',
        required: false,
    })
    @ApiQuery({
        name: 'serialNo',
        description: 'The serial number of a competitor equipment',
        required: false,
    })
    async getCompetitorEquipmentsByQuery(@Query('id') id?: string, @Query('serialNo') serialNo?: string): Promise<CRMCompetitorEquipmentDto[]> {
        return this.service.getCompetitorEquipmentByQuery({ id, serialNo });
    }

    @Post('competitor-equipments')
    async createCompetitorEquipment(@Body() input: CRMCompetitorEquipmentDto): Promise<CRMCompetitorEquipmentDto> {
        return this.service.createCompetitorEquipment(input);
    }

    @Get('customers')
    @ApiQuery({
        name: 'email',
        description: 'customer email',
        required: false,
    })
    @ApiQuery({
        name: 'phone',
        description: 'customer phone',
        example: '60166833704',
        required: false,
    })
    async getCustomerByQuery(@Query('email') email?: string, @Query('phone') phone?: string) {
        return this.service.getCustomerByQuery({ email, phone });
    }

    @Post('customers')
    async createCustomer(@Body(new ParsePhoneNumberPipe(['phone'])) input: CreateCRMCustomerInput): Promise<CRMCustomerDto> {
        return this.service.createCustomer(input);
    }

    @Put('customers')
    async createCustomerIfNotExist(@Body(new ParsePhoneNumberPipe(['phone'])) input: CreateCRMCustomerInput) {
        return this.service.createCustomerIfNotExist(input);
    }

    @Post('sync-service-request/:id')
    async syncServiceRequest(@Param('id') id: string) {
        return this.commandBus.execute(new CreateCRMServiceRequestCommand(id));
    }

    @Get('equipments')
    @ApiQuery({
        name: 'warrantyCardCode',
        description: 'The warranty card code (combination of serial-id, batch-id, and material-id) of an air-conditional unit.',
        required: true,
        example: '*SFHC100AV1M  20641911-K20G01',
    })
    @ApiQuery({
        name: 'principal',
        description: 'The principal account code: AMSS (for ACSON) or DMSS (for DAIKIN).',
        example: Tenant.Acson,
    })
    async getEquipmentsByQuery(@Query('warrantyCardCode') warrantyCardCode: string, @Query('principal') principal: Tenant): Promise<CRMEquipmentDto> {
        if (!warrantyCardCode) {
            throw new BadRequestException("Missing mandatory query parameter: 'warrantyCardCode'");
        }

        if (!principal) {
            throw new BadRequestException("Missing mandatory query parameter: 'principal'");
        }

        const [materialId, batchIdAndSerialId] = warrantyCardCode
            .replace('*', '')
            .trim()
            .split(' ')
            .filter(code => !!code);
        const [batchId, serialId] = batchIdAndSerialId.split('-');

        // todo(roy): found out if serialId needs to un-pad 0.
        // todo(roy): add to query by materialId, too.
        const equipments = await this.service.getEquipmentsByQuery({ serialId });
        if (equipments.length < 1) {
            throw new NotFoundException(`C4C equipment not found with 'serialId'='${serialId}' and 'materialId'='${materialId}'`);
        }

        const mockedEquipment = equipments[0];
        mockedEquipment.materialId = materialId;

        if (mockedEquipment.warrantyRegistrationNo) {
            throw new C4CEquipmentAlreadyWarrantedError();
        }

        return mockedEquipment;
    }

    @Put('warranty-registrations')
    async registerEquipmentWarranty(
        @Body(new ParsePhoneNumberPipe(['customerPhone'])) input: RegisterCrmWarrantyEquipmentsInput,
    ): Promise<CRMWarrantyEquipmentsDto> {
        const warrantedEquipments = await this.service.registerEquipmentsToWarranty(input);
        const customer = await this.service.createCustomerIfNotExist(CreateCRMCustomerInput.fromCRMWarrantyRegistration(input));
        // todo(roy): link customer and equipments
        return new CRMWarrantyEquipmentsDto(customer, warrantedEquipments);
    }

    @Get('customers/:id')
    async getCustomerById(@Param('id') id: string) {
        return this.service.getCustomerByQuery({ id });
    }
}
