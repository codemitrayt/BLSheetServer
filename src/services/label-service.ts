import { LabelModel } from "../model";
import { Label } from "../types";

class LableService {
  constructor(private labelModel: typeof LabelModel) {}

  async createLabel(label: Label) {
    return await this.labelModel.create(label);
  }
}

export default LableService;
