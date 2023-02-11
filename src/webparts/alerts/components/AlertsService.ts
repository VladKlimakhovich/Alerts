import { SPHttpClient } from "@microsoft/sp-http";
import { IArrayItem } from "./IArrayItem";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { SPPermission } from '@microsoft/sp-page-context';
import { SPHttpClientResponse } from '@microsoft/sp-http';

export default class AlertsService {

  constructor(webpartContext: WebPartContext, nameOfList: string) {
    this.context = webpartContext;
    this.nameList = nameOfList;

  }

  private nameList: string;
  private context: WebPartContext;


  public async getItems(): Promise<IArrayItem[]> {

    const webUrl = this.context.pageContext.web.absoluteUrl;
    const sortByDateTime = "?$select=Id,Title,Description,Level,DateFrom,DateTo&$filter=(DateFrom le datetime'" + this.getDateTimeFrom() + "') and (DateTo ge datetime'" + this.getDateTimeTo() + "')&$top=10";
    const responce = await this.context.spHttpClient.get(
      webUrl + "/_api/web/lists/getbytitle('" + this.nameList + "')/items" + sortByDateTime,
      SPHttpClient.configurations.v1
    );
    if (responce.ok) {
      const resultJson = await responce.json();

      const resultMap = resultJson.value.map((item: IArrayItem) => {
        return {
          Title: item.Title,
          Id: item.Id,
          Description: item.Description,
          Level: item.Level
        }
      })

      const arrayFromServer: IArrayItem[] = resultMap;


      return arrayFromServer;
    } else {
      const responceText = await responce.text();
      throw new Error(responceText);
    }
  }

  public async onDelete(itemId: number | undefined): Promise<SPHttpClientResponse> {
    const request: any = {};
    request.headers = {
      'X-HTTP-Method': 'DELETE',
      'IF-MATCH': '*'
    };

    const endpoint: string = this.context.pageContext.web.absoluteUrl
      + "/_api/web/lists/getbytitle('" + this.nameList + "')/items(" + itemId + ")";

    return await this.context.spHttpClient.post(endpoint, SPHttpClient.configurations.v1, request);
  }



  public getDateTimeFrom(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    let monthToString = month.toString();
    const dt = date.getDate();
    let dtToString = dt.toString();
    if (dt < 10) {
      dtToString = '0' + dtToString;
    }
    if (month < 10) {
      monthToString = '0' + monthToString;
    }
    return year + '-' + monthToString + '-' + dtToString + 'T00:00:00.000Z';

  }


  public getDateTimeTo(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    let monthToString = month.toString();
    const dt = date.getDate();
    let dtToString = dt.toString();
    if (dt < 10) {
      dtToString = '0' + dtToString;
    }
    if (month < 10) {
      monthToString = '0' + monthToString;
    }

    return year + '-' + monthToString + '-' + dtToString + 'T23:59:00.000Z';
  }

  public static checkCurrentUserIsAbleToManageList(context: WebPartContext): boolean {
    let isAbleToProvision = false;
    if (context.pageContext !== undefined) {
      const currentPermission = context.pageContext.web.permissions;
      isAbleToProvision = currentPermission.hasPermission(SPPermission.manageLists) && currentPermission.hasPermission(SPPermission.managePermissions);
      console.log("Current user permission: { High:" + currentPermission.value.High + ",Low:" + currentPermission.value.Low + "}");
      console.log("Current user is" + (isAbleToProvision ? " " : "not ") + "able to manage lists and permissions.");
    }
    return isAbleToProvision;
  }
}