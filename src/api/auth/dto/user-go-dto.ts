export class UserGoDto {
    id: string;
    username: string;
    phoneNumber: string;
    nationalCode: string;
    name: string;
    family: string;
    roles: string[];
    notifications: any;

    constructor(user: any) {
        this.id = user.id;
        this.username = user.username;
        this.phoneNumber = user.phoneNumber;
        this.nationalCode = user.nationalCode;
        this.name = user.name;
        this.family = user.family;
    }
}
