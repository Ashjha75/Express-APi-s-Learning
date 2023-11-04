function setObjectKeyValue(obj: any, key: string, value: any): void {
    obj[key] = value;
}
export class commonservices {
    public accountDetails: any;
    public setvalue(data: any) {
        this.accountDetails = data
    }
    public getvalue() {
        return this.accountDetails
    }
}