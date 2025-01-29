import { Link, LinkProps } from "react-aria-components";

interface NavigationBoxProps extends Omit<LinkProps, "children"> {
  children?: React.ReactNode;
  src?: string;
}

export function NavigationBox({ children, src, ...other }: NavigationBoxProps) {
  return (
    <Link
      style={{ backgroundImage: `url("${src}")` }}
      className="flex text-center text-white bg-cover m-175 rounded-medium h-2000 w-2000 p-60 focus-visible:ring focus:outline-hidden"
      {...other}
    >
      <div
        className="m-auto font-semibold"
        style={{ textShadow: "#000 0 0 5px" }}
      >
        {children}
      </div>
    </Link>
  );
}
