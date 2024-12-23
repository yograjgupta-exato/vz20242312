import { Controller, Post, Get, UseGuards, Param, Body, Patch, ParseArrayPipe } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiTags, ApiParam, ApiOperation, ApiBody } from '@nestjs/swagger';
import { plainToClass } from 'class-transformer';
import { CurrentUser, CustomApiHeaders } from '@shared/decorators';
import { SubmitTechnicalNotesCommand } from '@service-request/commands/submit-technical-notes.command';
import { ServiceRequestDto } from '@service-request/dto/service-request.dto';
import { IServiceRequest } from '@service-request/interfaces/service-request.interface';
import { GetActiveServiceRequestsOfProviderQuery } from '@service-request/queries/get-active-service-requests-of-provider.query';
import { GetHistoricalServiceRequestsOfProviderQuery } from '@service-request/queries/get-historical-service-requests-of-provider.query';
import { TechnicalNoteDto } from '../service-request/dto/technical-note.dto';
import { AcceptNewDispatchedJobCommand } from './commands/accept-new-dispatched-job.command';
import { AllocateJobToWorkerCommand } from './commands/allocate-job-to-worker.command';
import { CancelJobCommand } from './commands/cancel-job.command';
import { ManuallyAssignJobToProviderCommand } from './commands/manually-assign-job-to-provider.command';
import { RevokeJobCommand } from './commands/revoke-job.command';
import { CandidateDto } from './dto/candidate.dto';
import { JobDtoFactory } from './dto/factories/job.dto.factory';
import { HandleServicingJobInput } from './dto/handle-servicing-job.input';
import { JobDto } from './dto/job.dto';
import { ManualAssignmentInput } from './dto/manual-assignment.input';
import { GetCandidatesQuery } from './queries/get-candidates.query';
import { GetJobDetailOfProviderQuery } from './queries/get-job-detail-of-provider.query';
import { GetNewDispatchedJobsOfProviderQuery } from './queries/get-new-dispatched-jobs-of-provider.query';
import { GetWorkersOfDealerQuery } from './queries/get-workers-of-dealer.query';
import { JwtAuthGuard } from 'auth/guards/jwt-auth.guard';
import { HandleServicingJobCommand } from 'handling/commands/handle-servicing-job.command';
import { HandlingEventInput } from 'handling/dto/handling-event.input';
import { ServiceProvider } from 'service-provider/service-provider.entity';

@ApiTags('job')
@CustomApiHeaders()
@Controller('jobs')
export class JobController {
    constructor(private readonly commandBus: CommandBus, private readonly queryBus: QueryBus) {}

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get active job (assigned/allocated) feeds.' })
    @Get('')
    @UseGuards(JwtAuthGuard)
    async getAssignedOrAllocatedJobs(@CurrentUser('sub') providerId: string): Promise<JobDto[]> {
        const serviceRequests: IServiceRequest[] = await this.queryBus.execute(new GetActiveServiceRequestsOfProviderQuery(providerId));
        return JobDtoFactory.createFromList(serviceRequests);
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get new job feeds.' })
    @Get('new')
    @UseGuards(JwtAuthGuard)
    async getNewJobs(@CurrentUser('sub') providerId: string): Promise<JobDto[]> {
        return this.queryBus.execute(new GetNewDispatchedJobsOfProviderQuery(providerId));
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get historical job feeds' })
    @Get('history')
    @UseGuards(JwtAuthGuard)
    async getHistoricalJobs(@CurrentUser('sub') providerId: string): Promise<JobDto[]> {
        const serviceRequests: IServiceRequest[] = await this.queryBus.execute(new GetHistoricalServiceRequestsOfProviderQuery(providerId));
        return JobDtoFactory.createFromList(serviceRequests);
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get job detail.' })
    @ApiParam({ name: 'id', description: 'The unique identifier for the service request.' })
    @Get(':id')
    @UseGuards(JwtAuthGuard)
    async getJobDetail(@CurrentUser('sub') providerId: string, @Param('id') id: string): Promise<ServiceRequestDto> {
        const serviceRequest: IServiceRequest = await this.queryBus.execute(new GetJobDetailOfProviderQuery(id, providerId));
        return serviceRequest.toDto();
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Accept a new job.' })
    @ApiParam({ name: 'id', description: 'The unique identifier for a service request.' })
    @Post(':id/accept')
    @UseGuards(JwtAuthGuard)
    async acceptNewJob(@CurrentUser('sub') providerId: string, @Param('id') id: string): Promise<JobDto> {
        return this.commandBus.execute(new AcceptNewDispatchedJobCommand(providerId, id));
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Manually assign a dealer/freelancer to the job' })
    @ApiParam({ name: 'id', description: 'The unique identifier for the service request.' })
    @Post(':id/assign')
    async manualAssignment(@Param('id') id: string, @Body() input: ManualAssignmentInput): Promise<ServiceRequestDto> {
        const serviceRequest: IServiceRequest = await this.commandBus.execute(new ManuallyAssignJobToProviderCommand(input.providerId, id));
        return serviceRequest.toDto();
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Dealer: Allocate a worker to the job' })
    @ApiParam({ name: 'id', description: 'The unique identifier for the service request.' })
    @Post(':id/allocate')
    @UseGuards(JwtAuthGuard)
    async allocateWorker(
        @CurrentUser('sub') providerId: string,
        @Param('id') id: string,
        @Body() input: ManualAssignmentInput,
    ): Promise<ServiceRequestDto> {
        const serviceRequest: IServiceRequest = await this.commandBus.execute(new AllocateJobToWorkerCommand(providerId, input.providerId, id));
        return serviceRequest.toDto();
    }

    // todo(roy): potentially converge with /candidates
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Scan suitable workers for the job.' })
    @ApiParam({ name: 'id', description: 'The unique identifier for the service request.' })
    @Get(':id/workers')
    @UseGuards(JwtAuthGuard)
    async workers(@CurrentUser('sub') dealerId: string, @Param('id') id: string): Promise<ServiceProvider[]> {
        return this.queryBus.execute(new GetWorkersOfDealerQuery(dealerId, id));
    }

    @ApiOperation({ summary: 'Scan suitable candidate for the job.' })
    @ApiParam({ name: 'id', description: 'The unique identifier for the service request.' })
    @Get(':id/candidates')
    async candidates(@Param('id') id: string): Promise<CandidateDto[]> {
        return this.queryBus.execute(new GetCandidatesQuery(id));
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Perform next action in servicing job' })
    @ApiParam({ name: 'id', description: 'The unique identifier for the service request.' })
    @Post(':id/continue')
    @UseGuards(JwtAuthGuard)
    async handleServicingJob(
        @CurrentUser('sub') providerId: string,
        @Param('id') id: string,
        @Body() input: HandleServicingJobInput,
    ): Promise<ServiceRequestDto> {
        const hei: HandlingEventInput = plainToClass(HandlingEventInput, input);
        hei.providerWorkerId = providerId;
        hei.serviceRequestId = id;
        const serviceRequest: IServiceRequest = await this.commandBus.execute(new HandleServicingJobCommand(hei));
        return serviceRequest.toDto();
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Cancel a job' })
    @ApiParam({ name: 'id', description: 'The unique identifier for the service request.' })
    @Post(':id/cancel')
    @UseGuards(JwtAuthGuard)
    async cancel(@CurrentUser('sub') providerId: string, @Param('id') id: string): Promise<ServiceRequestDto> {
        const serviceRequest: IServiceRequest = await this.commandBus.execute(new CancelJobCommand(providerId, id));
        return serviceRequest.toDto();
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Revoke a job' })
    @ApiParam({ name: 'id', description: 'The unique identifier for the service request.' })
    @Post(':id/revoke')
    async revoke(@Param('id') id: string): Promise<ServiceRequestDto> {
        const serviceRequest: IServiceRequest = await this.commandBus.execute(new RevokeJobCommand(id));
        return serviceRequest.toDto();
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Mark a job as failed' })
    @ApiParam({ name: 'id', description: 'The unique identifier for the service request.' })
    @Post(':id/fail')
    async fail(@Param('id') id: string): Promise<ServiceRequestDto> {
        const serviceRequest: IServiceRequest = await this.commandBus.execute(new RevokeJobCommand(id, true));
        return serviceRequest.toDto();
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: "Submit Service Package's technical note of a Service Request" })
    @ApiParam({ name: 'id' })
    @ApiParam({ name: 'servicePackageId' })
    @ApiBody({ type: TechnicalNoteDto, isArray: true })
    @Patch(':id/service-packages/:servicePackageId/notes')
    @UseGuards(JwtAuthGuard)
    patchTechnicalNote(
        @Param('id') id: string,
        @Param('servicePackageId') servicePackageId: string,
        @Body(new ParseArrayPipe({ items: TechnicalNoteDto })) technicalNotes: TechnicalNoteDto[],
    ): Promise<TechnicalNoteDto[]> {
        return this.commandBus.execute(new SubmitTechnicalNotesCommand(id, servicePackageId, technicalNotes));
    }

    // @Post('dispatch')
    // async dispatch(@Body() autoAllocationInput: AutoAllocationInput) {
    //     await this.commandBus.execute(new InitiateAutoAssignmentCommand(autoAllocationInput));
    //     return true;
    // }
}
