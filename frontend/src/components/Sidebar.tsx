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
				className={`fixed left-0 top-0 h-full bg-gradient-to-b from-green-800 via-green-900 to-green-950 text-white transition-all duration-300 ease-in-out z-50 shadow-2xl border-r border-green-700/30 ${
					isExpanded ? 'w-64' : 'w-16'
				} flex flex-col justify-between`}
			>
				<div>
					{/* Toggle Button */}
					<button 
						onClick={(e) => { e.stopPropagation(); onToggleExpand(); }}
						className="absolute -right-3 top-6 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-xl border-2 border-white"
					>
						<svg
							className={`w-5 h-5 transition-transform duration-300 ${isExpanded ? '' : 'rotate-180'}`}
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							{/* Arrow points left when expanded, right when collapsed */}
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
						</svg>
					</button>

					{/* Branding Section */}
					<div className="p-4 border-b border-green-600/30 flex flex-col items-center bg-gradient-to-r from-green-800/50 to-green-700/50">
						{isExpanded ? (
							<div className="flex flex-row items-center justify-center w-full mb-3 gap-3">
								<div className="bg-white/15 rounded-lg p-2 border border-white/30">
									<img 
										src="/images/logos/SanPedro.png" 
										alt="San Pedro Logo" 
										className="transition-all duration-300 h-8 w-auto"
									/>
								</div>
								<div className="bg-white/15 rounded-lg p-2 border border-white/30">
									<img 
										src="/images/logos/CityVet.jpg" 
										alt="CityVet Logo" 
										className="transition-all duration-300 h-8 w-auto rounded-md"
									/>
								</div>
							</div>
						) : (
							<div className="bg-white/15 rounded-lg p-1.5 border border-white/30">
								<img 
									src="/images/logos/SanPedro.png" 
									alt="San Pedro Logo" 
									className="transition-all duration-300 h-6 w-auto mb-0"
								/>
							</div>
						)}
						{isExpanded && (
							<div className="transition-all duration-300 opacity-100">
								<h2 className="text-sm font-bold text-center mb-1 bg-gradient-to-r from-white to-green-100 bg-clip-text text-transparent">City Veterinary Office</h2>
								<p className="text-xs text-center text-green-200/90 font-medium">San Pedro, Laguna</p>
							</div>
						)}
					</div>

					{/* Navigation Menu */}
					<nav className="mt-4 flex-1">
						<ul className={`space-y-3 ${isExpanded ? 'px-3' : 'px-2'}`}>
							{items.map((item) => (
								<li key={item.label}>
									<button
										onClick={(e) => { 
											e.stopPropagation();
											onItemClick(item.path);
										}}
											className={`w-full flex items-center ${isExpanded ? 'px-4 justify-start' : 'px-1 justify-center'} py-3 rounded-xl transition-all duration-300 group relative transform hover:scale-105 ${
												activeItem === item.path
													? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg border border-green-500/30'
													: 'text-green-100 hover:bg-gradient-to-r hover:from-green-700/50 hover:to-green-600/50 hover:text-white hover:shadow-md border border-transparent hover:border-green-500/20'
											}`}
									>
										{/* Icon */}
										<div className={`flex-shrink-0 transition-all duration-300 ${
											isExpanded ? 'mr-4' : ''
										}`}> 
											<div className="w-6 h-6 flex items-center justify-center">
												{item.icon}
											</div>
										</div>
												{/* Label */}
												<span 
													className={`font-semibold text-sm transition-all duration-300 ${
														isExpanded 
															? 'opacity-100 translate-x-0' 
															: 'opacity-0 -translate-x-4 absolute left-0'
													} ${activeItem === item.path ? 'text-white' : 'text-green-50'}`}
												>
													{item.label}
												</span>
												{/* Enhanced Tooltip for collapsed state */}
												{!isExpanded && (
													<div className="absolute left-full ml-3 px-3 py-2 bg-gradient-to-r from-gray-800 to-gray-900 text-white text-sm rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap z-50 shadow-lg border border-gray-600/50 transform group-hover:translate-x-1">
														<div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-800 rotate-45"></div>
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
					<div className="flex flex-col items-center mb-4 p-2">
						<div className="bg-gradient-to-r from-green-700/50 to-green-600/50 rounded-xl p-2 border border-green-500/30">
							<img 
								src="/images/logos/CityVet.jpg" 
								alt="CityVet Logo" 
								className="h-6 w-auto transition-all duration-300 rounded-lg"
							/>
						</div>
					</div>
				)}
			</aside>
		</>
	);
};

export default Sidebar; 