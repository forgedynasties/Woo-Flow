"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";

const navItems = [
	{ name: "Dashboard", href: "/", icon: "dashboard" },
	{ name: "Products", href: "/products", icon: "inventory_2" },
	{ name: "Categories", href: "/categories", icon: "category" },
	{ name: "Settings", href: "/settings", icon: "settings" },
];

export function Sidebar() {
	const pathname = usePathname();

	return (
		<div className="w-64 h-screen bg-sidebar text-sidebar-foreground border-r border-sidebar-border fixed">
			<div className="p-6 flex justify-between items-center">
				<h1 className="text-2xl font-bold text-sidebar-primary flex items-center gap-2">
					<span className="material-icons">shopping_bag</span>
					WooFlow
				</h1>
				<ThemeToggle />
			</div>
			<nav className="mt-6">
				<ul className="list-none">
					{navItems.map((item) => {
						const isActive = pathname === item.href;
						return (
							<li key={item.name} className="mb-2">
								<Link
									href={item.href}
									className={`flex items-center px-6 py-3 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors ${
										isActive
											? "bg-sidebar-accent text-sidebar-accent-foreground font-medium border-l-4 border-sidebar-primary"
											: ""
									}`}
								>
									<span className="material-icons mr-3">{item.icon}</span>
									{item.name}
								</Link>
							</li>
						);
					})}
				</ul>
			</nav>
		</div>
	);
}