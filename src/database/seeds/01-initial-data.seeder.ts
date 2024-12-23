import { v4 as uuidv4 } from 'uuid';
import { Connection } from 'typeorm';
import { Factory, Seeder } from 'typeorm-seeding';
import { AdminUser } from '../../admin-user/admin-user.entity';
import { GeneralStatus, UserType } from '../../shared/enums';
import { UserLogin } from '../../auth/auth.entity';
import { FeedbackType } from '../../feedback/feedback-type.entity';
import { AdminPermission } from '../../admin-permission/admin-permission.entity';
import { AdminRole } from '../../admin-role/admin-role.entity';
import { ServiceArea } from '../../service-area/entities/service-area.entity';
import { serviceAreas } from './service-area/data';

export default class InitialDataSeeder implements Seeder {
    public async run(factory: Factory, connection: Connection): Promise<any> {
        await this.createSuperAdmin(connection);
        await this.createFeedbackTypes(connection);
        await this.createPermission(connection);
        await this.createServiceAreas(connection);
    }

    private async createSuperAdmin(connection: Connection) {
        await connection
            .createQueryBuilder()
            .insert()
            .into(AdminUser)
            .values([
                {
                    id: '00000000-0000-0000-0000-ef0dd192de7c',
                    name: 'SuperAdmin',
                    emailAddress: 'admin@demo.com',
                    generalStatus: GeneralStatus.ACTIVE,
                },
            ])
            .execute();

        await connection
            .createQueryBuilder()
            .insert()
            .into(UserLogin)
            .values([
                {
                    id: uuidv4(),
                    userType: UserType.ADMIN,
                    userId: '00000000-0000-0000-0000-ef0dd192de7c',
                    username: 'admin@demo.com',
                    passwordHash: '$2b$12$6RFoTGm7w47saerYIFAkQ.wf11/i5pD5iq8hb3yrtsJMPo09mkUWC',
                    isVerified: true,
                    generalStatus: GeneralStatus.ACTIVE,
                },
            ])
            .execute();
    }

    private async createFeedbackTypes(connection: Connection) {
        await connection
            .createQueryBuilder()
            .insert()
            .into(FeedbackType)
            .values([
                {
                    code: 'service-provider-cancellations',
                    title: 'Service Provider Cancellation Reason',
                },
                {
                    code: 'service-provider-feedbacks',
                    title: 'Service Provider Feedback',
                },
                {
                    code: 'consumer-cancellations',
                    title: 'Consumer Cancellation Reason',
                },
                {
                    code: 'consumer-rating-feedbacks',
                    title: 'Consumer Rating Feedback',
                },
            ])
            .execute();
    }

    private async createPermission(connection: Connection) {
        await connection
            .createQueryBuilder()
            .insert()
            .into(AdminPermission)
            .values([
                { code: 'feedbacks-list', name: 'Feedback List' },
                { code: 'consumer-rating-feedbacks-list', name: 'Consumer Rating Feedback List' },
                { code: 'service-provider-feedbacks-list', name: 'Service Provider Feedback List' },
                { code: 'consumer-cancellations-list', name: 'Consumer Cancellation List' },
                { code: 'service-provider-cancellations-list', name: 'Service Provider Cancellation List' },
                { code: 'skills-list', name: 'Skill List' },
                { code: 'skills-create', name: 'Create Skill' },
                { code: 'skills-delete', name: 'Delete Skill' },
                { code: 'skills-update', name: 'Update Skill' },
                { code: 'dealers-list', name: 'Dealer List' },
                { code: 'dealers-create', name: 'Create Dealer' },
                { code: 'dealers-update', name: 'Update Dealer' },
                { code: 'dealers-delete', name: 'Delete Dealer' },
                { code: 'feedbacks-create', name: 'Create Feedback' },
                { code: 'feedbacks-update', name: 'Update Feedback' },
                { code: 'feedbacks-delete', name: 'Delete Feedback' },
                { code: 'service-packages-list', name: 'Service Package List' },
                { code: 'service-packages-create', name: 'Create Service Package' },
                { code: 'service-packages-update', name: 'Update Service Package' },
                { code: 'service-packages-delete', name: 'Delete Service Package' },
                { code: 'service-providers-list', name: 'Service Provider List' },
                { code: 'service-providers-create', name: 'Create Service Provider' },
                { code: 'service-providers-update', name: 'Update Service Provider' },
                { code: 'service-providers-delete', name: 'Delete Service Provider' },
                { code: 'service-tickets-list', name: 'Service Ticker List' },
                { code: 'service-tickets-assign', name: 'Assign Service Ticket' },
                { code: 'service-tickets-revoke', name: 'Revoke Service Ticket' },
                { code: 'service-types-list', name: 'Service Type List' },
                { code: 'service-types-create', name: 'Create Service Type' },
                { code: 'service-types-update', name: 'Update Service Type' },
                { code: 'service-types-delete', name: 'Delete Service Type' },
                { code: 'users-list', name: 'User List' },
                { code: 'users-create', name: 'Create User' },
                { code: 'users-update', name: 'Update User' },
                { code: 'users-delete', name: 'Delete User' },
                { code: 'roles-list', name: 'Role List' },
                { code: 'announcements-list', name: 'Announcement List' },
                { code: 'announcements-create', name: 'Create Announcement' },
                { code: 'announcements-update', name: 'Update Announcement' },
                { code: 'announcements-delete', name: 'Delete Announcement' },
                { code: 'promotions-list', name: 'Promotion List' },
                { code: 'promotions-create', name: 'Create Promotion' },
                { code: 'promotions-update', name: 'Update Promotion' },
                { code: 'promotions-delete', name: 'Delete Promotion' },
            ])
            .execute();
        await connection
            .createQueryBuilder()
            .insert()
            .into(AdminRole)
            .values([
                {
                    id: 1,
                    name: 'Super Admin',
                    description: 'User who has god privilege.',
                },
            ])
            .execute();
        const adminUserRepo = connection.getRepository(AdminUser);
        const adminRolesRepo = connection.getRepository(AdminRole);
        const adminPermissionsRepo = connection.getRepository(AdminPermission);
        const permissions = await adminPermissionsRepo.find();
        const admin = await adminUserRepo.findOne({
            id: '00000000-0000-0000-0000-ef0dd192de7c',
        });
        const role = await adminRolesRepo.findOne(1);
        role.permissions = permissions;
        await connection.manager.save(role);
        admin.roles = [role];
        await connection.manager.save(admin);
    }

    private async createServiceAreas(connection: Connection) {
        const KualaLumpur = {};
        await connection
            .createQueryBuilder()
            .insert()
            .into(ServiceArea)
            .values(serviceAreas)
            .execute();
    }
}
