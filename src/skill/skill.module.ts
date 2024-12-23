import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SkillController } from './skill.controller';
import { Skill } from './skill.entity';
import { SkillService } from './skill.service';

@Module({
    controllers: [SkillController],
    providers: [SkillService],
    imports: [CqrsModule, TypeOrmModule.forFeature([Skill])],
    exports: [SkillService],
})
export class SkillModule {}
