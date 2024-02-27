import { NavLink, useNavigate } from "react-router-dom";
import { logoutUser } from "../services/auth-service";
import { useContext } from "react";
import { AppContext } from "../context/AppContext";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "@/components/ui/menubar"


const Header = ({ theme, onThemeChange }) => {
  // const { user, setContext } = useContext(AppContext);

  // const navigate = useNavigate();

  // const logOut = async () => {
  //   await logoutUser();
  //   setContext({ user: null, userData: null });
  //   navigate("/");
  // };

  // const isChecked = theme === "synthwave";

  // const handleClick = () => {
  //   onThemeChange({ target: { checked: !isChecked } });
  // };

  return (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>
            New Tab <MenubarShortcut>⌘T</MenubarShortcut>
          </MenubarItem>
          <MenubarItem> <NavLink to="/login">Login</NavLink> </MenubarItem>
          <MenubarSeparator />
          <MenubarItem>Share</MenubarItem>
          <MenubarSeparator />
          <MenubarItem>Print</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
};

export default Header;
