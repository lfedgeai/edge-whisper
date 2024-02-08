import { Navbar, NavbarBrand, NavbarContent, NavbarItem, NavbarMenu, NavbarMenuToggle, cn } from '@nextui-org/react';
import ThemeSwitcher from '../ThemeSwitcher';
import Link from 'next/link';

export const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Nav />
      {children}
    </>
  );
};

const Nav = () => {
  return (
    <Navbar maxWidth="full">
      <NavbarContent justify="start">
        <NavbarMenuToggle className="lg:hidden" />
        <NavbarBrand className="hidden lg:flex">
          <Logo />
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="lg:hidden" justify="center">
        <NavbarBrand>
          <Logo />
        </NavbarBrand>
      </NavbarContent>

      {/* <NavbarContent justify="end" className="gap-6">
        <NavbarItem>
          <ThemeSwitcher />
        </NavbarItem>
      </NavbarContent> */}

      <NavbarMenu className="pt-4"></NavbarMenu>
    </Navbar>
  );
};

const Logo = () => {
  return (
    <Link href="/">
      <div className="flex items-center">
        <img src="/logo1.png" className="h-4" alt="Logo" />
        <img src="/logo2.png" className="ml-2 h-4" alt="Logo" />
      </div>
    </Link>
  );
};
