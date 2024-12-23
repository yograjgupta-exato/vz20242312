import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Refund } from './refund.entity';
import { RefundService } from './refund.service';

@Module({
    imports: [TypeOrmModule.forFeature([Refund])],
    providers: [RefundService],
    exports: [RefundService],
})
export class RefundModule {}
