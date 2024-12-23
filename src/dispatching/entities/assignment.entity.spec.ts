import { Assignment } from './assignment.entity';

describe('Dispatching Entity', () => {
    let assignment: Assignment;
    let dateNowMockFn;
    beforeEach(() => {
        assignment = new Assignment();
        dateNowMockFn = jest.spyOn(Date, 'now').mockImplementation(() => 1479427200000);
    });
    afterEach(() => {
        dateNowMockFn.mockRestore();
    });

    it('should derive expiredAt from requestSeconds = 100', () => {
        const requestSeconds = 100;
        assignment.changeRequestSeconds(requestSeconds);

        expect(assignment.getCurrentRequestSeconds()).toEqual(requestSeconds);
        expect(assignment.expiredAt).toEqual(new Date(Date.now() + requestSeconds * 1000));
    });

    it('should derive expiredAt from requestSeconds = 0', () => {
        const requestSeconds = 0;
        assignment.changeRequestSeconds(requestSeconds);

        expect(assignment.getCurrentRequestSeconds()).toEqual(requestSeconds);
        expect(assignment.expiredAt).toEqual(new Date(Date.now() + requestSeconds * 1000));
    });
});
