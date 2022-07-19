import { Link, NavLink, useSubmit } from "@remix-run/react";
import { Fragment } from "react";
import { Disclosure, Menu, Transition } from "@headlessui/react";
import { MenuIcon, XIcon, UserIcon } from "@heroicons/react/outline";
import logoHref from "~/assets/logo.svg";
import { classNames, useUser } from "~/utils";

type Navigation = Array<{ name: string; href: string }>;

function ProfileDropdown({
  userNavigation,
}: Pick<Parameters<typeof Header>[0], "userNavigation">) {
  const submit = useSubmit();
  return (
    <Menu as="div" className="relative">
      <div>
        <Menu.Button className="flex max-w-xs items-center rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
          <span className="sr-only">Open user menu</span>
          <UserIcon className="h-6 w-6" aria-hidden="true" />
        </Menu.Button>
      </div>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          {userNavigation.map((item) => (
            <Menu.Item key={item.name}>
              {({ active }) => (
                <a
                  href={item.href}
                  className={classNames(
                    active ? "bg-gray-100" : "",
                    "block px-4 py-2 text-sm text-gray-700"
                  )}
                >
                  {item.name}
                </a>
              )}
            </Menu.Item>
          ))}
          <Menu.Item key="logout">
            {({ active }) => (
              <a
                href="."
                className={classNames(
                  active ? "bg-gray-100" : "",
                  "block px-4 py-2 text-sm text-gray-700"
                )}
                onClick={(e) => {
                  e.preventDefault();
                  submit(null, {
                    action: "/logout",
                    method: "post",
                  });
                }}
              >
                Log out
              </a>
            )}
          </Menu.Item>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}

function MobileNavigation({
  navigation,
  userNavigation,
}: Pick<Parameters<typeof Header>[0], "navigation" | "userNavigation">) {
  const user = useUser();
  const submit = useSubmit();

  return (
    <Disclosure.Panel className="sm:hidden">
      <div className="space-y-1 pt-2 pb-3">
        {navigation.map((item) => (
          <Disclosure.Button key={item.name} as={Fragment}>
            <NavLink
              to={item.href}
              className={({ isActive }) =>
                classNames(
                  isActive
                    ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                    : "border-transparent text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800",
                  "block border-l-4 py-2 pl-3 pr-4 text-base font-medium"
                )
              }
            >
              {item.name}
            </NavLink>
          </Disclosure.Button>
        ))}
      </div>
      <div className="border-t border-gray-200 pt-4 pb-3">
        <div className="flex items-center px-4">
          <div className="flex-shrink-0">
            <UserIcon className="h-6 w-6" aria-hidden="true" />
          </div>
          <div className="ml-3 text-sm font-medium text-gray-500">
            {user.email}
          </div>
        </div>
        <div className="mt-3 space-y-1">
          {userNavigation.map((item) => (
            <Disclosure.Button
              key={item.name}
              as="a"
              href={item.href}
              className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
            >
              {item.name}
            </Disclosure.Button>
          ))}
          <Disclosure.Button key="logout" as={Fragment}>
            <a
              href="."
              className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
              onClick={(e) => {
                e.preventDefault();
                submit(null, {
                  action: "/logout",
                  method: "post",
                });
              }}
            >
              Log out
            </a>
          </Disclosure.Button>
        </div>
      </div>
    </Disclosure.Panel>
  );
}

export function Header({
  navigation,
  userNavigation,
}: {
  navigation: Navigation;
  userNavigation: Navigation;
}) {
  const user = useUser();
  const submit = useSubmit();

  // With page heading and stacked list
  // https://tailwindui.com/components/application-ui/page-examples/detail-screens
  // Simple
  // https://tailwindui.com/components/application-ui/navigation/navbars
  // Simplified based on https://tailwindui.com/templates/salient
  return (
    <>
      <Disclosure as="nav" className="border-b border-gray-200 bg-white">
        {({ open }) => (
          <>
            <div className="flex h-16 justify-between">
              <div className="flex">
                <Link to="/" className="flex-shrink-0 self-center">
                  <img className="h-8 w-auto" src={logoHref} alt="Access" />
                </Link>
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  {navigation.map((item) => (
                    <NavLink
                      key={item.name}
                      to={item.href}
                      className={({ isActive }) =>
                        classNames(
                          isActive
                            ? "border-indigo-500 text-gray-900"
                            : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
                          "inline-flex items-center border-b-2 px-1 pt-1 align-middle text-sm font-medium"
                        )
                      }
                    >
                      {item.name}
                    </NavLink>
                  ))}
                </div>
              </div>
              <div className="hidden sm:flex sm:items-center sm:gap-2">
                {/* Profile dropdown */}
                <div className="text-sm font-medium text-gray-500">
                  {user.email}
                </div>
                <Menu as="div" className="relative">
                  <div>
                    <Menu.Button className="flex max-w-xs items-center rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                      <span className="sr-only">Open user menu</span>
                      <UserIcon className="h-6 w-6" aria-hidden="true" />
                    </Menu.Button>
                  </div>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-200"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    {/* z-10 so it stacks above any controls in the page */}
                    <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      {userNavigation.map((item) => (
                        <Menu.Item key={item.name}>
                          {({ active }) => (
                            <a
                              href={item.href}
                              className={classNames(
                                active ? "bg-gray-100" : "",
                                "block px-4 py-2 text-sm text-gray-700"
                              )}
                            >
                              {item.name}
                            </a>
                          )}
                        </Menu.Item>
                      ))}
                      <Menu.Item key="logout">
                        {({ active }) => (
                          <a
                            href="."
                            className={classNames(
                              active ? "bg-gray-100" : "",
                              "block px-4 py-2 text-sm text-gray-700"
                            )}
                            onClick={(e) => {
                              e.preventDefault();
                              submit(null, {
                                action: "/logout",
                                method: "post",
                              });
                            }}
                          >
                            Log out
                          </a>
                        )}
                      </Menu.Item>
                    </Menu.Items>
                  </Transition>
                </Menu>
              </div>
              <div className="-mr-2 flex items-center sm:hidden">
                {/* Mobile menu button */}
                <Disclosure.Button className="inline-flex items-center justify-center rounded-md bg-white p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <MenuIcon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
            </div>

            <Disclosure.Panel className="sm:hidden">
              <div className="space-y-1 pt-2 pb-3">
                {navigation.map((item) => (
                  <Disclosure.Button key={item.name} as={Fragment}>
                    <NavLink
                      to={item.href}
                      className={({ isActive }) =>
                        classNames(
                          isActive
                            ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                            : "border-transparent text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800",
                          "block border-l-4 py-2 pl-3 pr-4 text-base font-medium"
                        )
                      }
                    >
                      {item.name}
                    </NavLink>
                  </Disclosure.Button>
                ))}
              </div>
              <div className="border-t border-gray-200 pt-4 pb-3">
                <div className="flex items-center px-4">
                  <div className="flex-shrink-0">
                    <UserIcon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <div className="ml-3 text-sm font-medium text-gray-500">
                    {user.email}
                  </div>
                </div>
                <div className="mt-3 space-y-1">
                  {userNavigation.map((item) => (
                    <Disclosure.Button
                      key={item.name}
                      as="a"
                      href={item.href}
                      className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                    >
                      {item.name}
                    </Disclosure.Button>
                  ))}
                  <Disclosure.Button key="logout" as={Fragment}>
                    <a
                      href="."
                      className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                      onClick={(e) => {
                        e.preventDefault();
                        submit(null, {
                          action: "/logout",
                          method: "post",
                        });
                      }}
                    >
                      Log out
                    </a>
                  </Disclosure.Button>
                </div>
              </div>
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>
      <header className="py-10">
        <Disclosure
          as="nav"
          className="relative z-50 border-b border-gray-200 text-sm"
        >
          {({ open }) => (
            <>
              <ul className="flex h-16 items-center">
                <li>
                  <Link to="/">
                    <span className="sr-only">Home</span>
                    <img className="h-8 w-auto" src={logoHref} alt="Access" />
                  </Link>
                </li>
                {navigation.map((i, idx) => (
                  <li
                    key={i.name}
                    className={classNames(
                      idx === 0 ? "ml-12" : "ml-6",
                      "hidden md:block"
                    )}
                  >
                    <NavLink
                      to={i.href}
                      className={({ isActive }) =>
                        classNames(
                          isActive
                            ? "border-indigo-500 text-gray-900"
                            : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
                          "inline-flex h-16 items-center border-b-2 px-1 pt-1 align-middle text-sm font-medium"
                        )
                      }
                    >
                      {i.name}
                    </NavLink>
                  </li>
                ))}
                <li className="ml-auto hidden sm:block">{user.email}</li>
                <li className="ml-6 hidden sm:block">
                  <ProfileDropdown userNavigation={userNavigation} />
                </li>
                <li className="ml-auto -mr-2 sm:hidden">
                  {/* <MobileNavigation /> */}
                  <Disclosure.Button className="inline-flex items-center justify-center rounded-md bg-white p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                    <span className="sr-only">Open main menu</span>
                    {open ? (
                      <XIcon className="block h-6 w-6" aria-hidden="true" />
                    ) : (
                      <MenuIcon className="block h-6 w-6" aria-hidden="true" />
                    )}
                  </Disclosure.Button>
                </li>
              </ul>
              <MobileNavigation
                navigation={navigation}
                userNavigation={userNavigation}
              />
            </>
          )}
        </Disclosure>
      </header>
    </>
  );
}
