/** Interface for returning the status of a function */
interface ActionStatus {
  /** Indicates whether the action was successful */
  isSuccessful: boolean;
  /** (Optional) Messages sent back by the action */
  message?: string;
}
export default ActionStatus;
