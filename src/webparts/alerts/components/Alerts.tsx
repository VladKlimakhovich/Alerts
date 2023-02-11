import * as React from 'react';
import styles from './Alerts.module.scss';
import { IAlertsProps } from './IAlertsProps';
import { IAlertsState } from './IAlertsState';
import AlertsService from './AlertsService'



export default class Alerts extends React.Component<IAlertsProps, IAlertsState> {


  constructor(props: IAlertsProps | Readonly<IAlertsProps>, state: IAlertsState) {
    super(props);

    this.state = {
      levelIcon: "",
      levelStyle: '',
      errorMessage: "",
      arrayAlerts: []
    };
    this.AlertService = new AlertsService(props.webpartContext, props.nameOfList);
  }


  private AlertService: AlertsService;

  private async loadData(): Promise<void> {

    try {
      const alerts = await this.AlertService.getItems();
      this.setState({
        arrayAlerts: alerts
      })
    } catch (e) {
      this.setState(
        {
          errorMessage: e.message
        }
      )
    }
  }
  public async componentDidMount(): Promise<void> {

    await this.loadData();
  }


  public getLevelIcon(level: string): string {
    let result = "❕";
    const critical = "⚠";
    const low = "✔";

    if (level === "critical") {
      result = critical;
    } else if (level === "low") {
      result = low;
    }
    return result;
  }

  public getLevelToClass(level: string): string {
    let result = styles.normal;
    if (level === "critical") {
      result = styles.critical;
    } else if (level === "low") {
      result = styles.low;
    }
    return result;
  }

  private async handleDelete(id: number | undefined): Promise<void> {
    await this.AlertService.onDelete(id);
    await this.loadData();
  }


  public render(): React.ReactElement<IAlertsProps> {
    return (
      <div  >
        {this.state.errorMessage}

        {this.state.arrayAlerts.map((alert, index) => (

          <div key={index} className={styles.object} >

            <div className={this.getLevelToClass(alert.Level)}>
              {this.getLevelIcon((alert.Level))}

              <strong>{alert.Title}</strong>
              {alert.Description}
              {AlertsService.checkCurrentUserIsAbleToManageList(this.props.webpartContext) && (
                <button onClick={() => this.handleDelete(alert.Id)} className="btn btn-lg btn-outline-danger ml-4">delete</button>
              )}

              <br /></div>

          </div>

        )

        )}
      </div>



    )
  }

}