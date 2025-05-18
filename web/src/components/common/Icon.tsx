import React from "react";
import { IconType, IconBaseProps } from "react-icons";

interface IconProps extends IconBaseProps {
  icon: IconType;
}

const Icon: React.FC<IconProps> = ({ icon: IconComponent, ...props }) => {
  return React.createElement(IconComponent as any, props);
};

export default Icon;
