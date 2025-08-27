import React from 'react';

interface SidebarItem {
	label: string;
	icon: React.ReactNode;
	path: string;
}

interface SidebarProps {
	items: SidebarItem[];
	activeItem: string;
	onItemClick: (item: string) => void;
	isExpanded: boolean;
	onToggleExpand: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
	items, 
	activeItem, 
	onItemClick, 
	isExpanded, 
	onToggleExpand 
}) => {
	const sidebarRef = React.useRef<HTMLElement | null>(null);

	return (
		<>
			<aside 
				ref={sidebarRef}
				onMouseEnter={() => { if (!isExpanded) { onToggleExpand(); } }}
				onMouseLeave={() => { if (isExpanded) { onToggleExpand(); } }}
				className={`fixed left-0 top-0 h-full bg-green-900 text-white transition-all duration-300 ease-in-out z-50 ${
					isExpanded ? 'w-64' : 'w-16'
				} flex flex-col justify-between`}
			>
				<div>
					{/* Toggle Button */}
					<button 
						onClick={(e) => { e.stopPropagation(); onToggleExpand(); }}
						className="absolute -right-3 top-6 bg-green-800 hover:bg-green-700 text-white rounded-full w-6 h-6 flex items-center justify-center transition-colors duration-200 shadow-lg"
					>
						<svg
							className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? '' : 'rotate-180'}`}
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							{/* Arrow points left when expanded, right when collapsed */}
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
						</svg>
					</button>

					{/* Branding Section */}
					<div className="p-4 border-b border-green-700 flex flex-col items-center">
						{isExpanded ? (
							<div className="flex flex-row items-center justify-center w-full mb-2 gap-2">
								<img 
									src="/images/logos/SanPedro.png" 
									alt="San Pedro Logo" 
									className="transition-all duration-300 h-8 w-auto"
								/>
								<img 
									src="/images/logos/CityVet.jpg" 
									alt="CityVet Logo" 
									className="transition-all duration-300 h-8 w-auto"
								/>
							</div>
						) : (
							<img 
								src="/images/logos/SanPedro.png" 
								alt="San Pedro Logo" 
								className="transition-all duration-300 h-6 w-auto mb-0"
							/>
						)}
						{isExpanded && (
							<div className="transition-all duration-300 opacity-100">
								<h2 className="text-sm font-bold text-center mb-1">City Veterinary Office</h2>
								<p className="text-xs text-center text-green-200">San Pedro, Laguna</p>
							</div>
						)}
					</div>

					{/* Navigation Menu - moved up by reducing margin-top */}
					<nav className="mt-2">
						<ul className="space-y-2 px-3">
							{items.map((item) => (
								<li key={item.label}>
									<button
										onClick={(e) => { 
											e.stopPropagation();
											if (!isExpanded) { return; }
											onItemClick(item.path);
										}}
										className={`w-full flex items-center px-3 py-3 rounded-lg transition-all duration-200 group relative ${
											activeItem === item.path
												? 'bg-green-700 text-white shadow-md'
												: 'text-green-100 hover:bg-green-800 hover:text-white'
										}`}
									>
										{/* Icon */}
										<div className={`flex-shrink-0 transition-all duration-300 ${
											isExpanded ? 'mr-3' : 'mx-auto'
										}`}> 
											<div className="w-5 h-5 flex items-center justify-center">
												{item.icon}
											</div>
										</div>
										{/* Label */}
										<span 
											className={`font-medium transition-all duration-300 ${
												isExpanded 
													? 'opacity-100 translate-x-0' 
													: 'opacity-0 -translate-x-4 absolute left-0'
											}`}
										>
											{item.label}
										</span>
										{/* Tooltip for collapsed state */}
										{!isExpanded && (
											<div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
												{item.label}
											</div>
										)}
									</button>
								</li>
							))}
						</ul>
					</nav>
				</div>
				{/* Bottom logo when collapsed */}
				{!isExpanded && (
					<div className="flex flex-col items-center mb-4">
						<img 
							src="/images/logos/CityVet.jpg" 
							alt="CityVet Logo" 
							className="h-6 w-auto transition-all duration-300"
						/>
					</div>
				)}
			</aside>
		</>
	);
};

export default Sidebar; 