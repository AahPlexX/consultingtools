import { strategyMarketCapabilities } from "./strategy-market.js";
import { customerGrowthCapabilities } from "./customer-growth.js";
import { financeMaCapabilities } from "./finance-ma.js";
import { operationsSupplyCapabilities } from "./operations-supply.js";
import { organizationProjectCapabilities } from "./organization-project.js";
import { dataForecastingCapabilities } from "./data-forecasting.js";
import { researchRiskSeoCapabilities } from "./research-risk-seo.js";
import { innovationDeliveryArtifactCapabilities } from "./innovation-delivery-artifacts.js";

export {
  strategyMarketCapabilities,
  customerGrowthCapabilities,
  financeMaCapabilities,
  operationsSupplyCapabilities,
  organizationProjectCapabilities,
  dataForecastingCapabilities,
  researchRiskSeoCapabilities,
  innovationDeliveryArtifactCapabilities,
};

export const allFamilyCapabilities = [
  ...strategyMarketCapabilities,
  ...customerGrowthCapabilities,
  ...financeMaCapabilities,
  ...operationsSupplyCapabilities,
  ...organizationProjectCapabilities,
  ...dataForecastingCapabilities,
  ...researchRiskSeoCapabilities,
  ...innovationDeliveryArtifactCapabilities,
] as const;
