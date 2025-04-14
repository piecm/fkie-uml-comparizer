import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

interface ClockTowerComparisonProps {
  showOriginal?: boolean;
  showReconstructed?: boolean;
}

// Define node dimensions outside the component to be referenced in the createModelTree function
const nodeHeight = 30;
const nodeWidthBase = 350;

const ClockTowerComparison: React.FC<ClockTowerComparisonProps> = ({ 
  showOriginal = true, 
  showReconstructed = true 
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  
  // Define the color scheme for differences
  const colors = {
    added: '#10b981',    // green for added elements
    removed: '#ef4444',  // red for removed elements
    modified: '#f59e0b', // orange for modified elements
    unchanged: '#64748b' // gray for unchanged elements
  };

  // Original model structure
  const originalModel = [
    { id: 'original_package_ClockTower', name: 'Package: ClockTower', level: 0, status: 'unchanged' },
    { id: 'original_profile_Mascaret', name: 'Profile: Mascaret', level: 1, status: 'removed', parent: 'original_package_ClockTower' },
    { id: 'original_stereotype_Entity', name: 'Stereotype: Entity', level: 2, status: 'removed', parent: 'original_profile_Mascaret' },
    { id: 'original_package_Environment', name: 'Package: Environment', level: 1, status: 'unchanged', parent: 'original_package_ClockTower' },
    { id: 'original_class_ClockTower', name: 'Class: ClockTower', level: 2, status: 'unchanged', parent: 'original_package_Environment' },
    { id: 'original_attribute_clock', name: 'Attribute: clock', level: 3, status: 'unchanged', parent: 'original_class_ClockTower' },
    { id: 'original_class_Clock', name: 'Class: Clock', level: 2, status: 'unchanged', parent: 'original_package_Environment' },
    { id: 'original_attribute_currentHour', name: 'Attribute: currentHour', level: 3, status: 'unchanged', parent: 'original_class_Clock' },
    { id: 'original_attribute_currentMinute', name: 'Attribute: currentMinute', level: 3, status: 'unchanged', parent: 'original_class_Clock' },
    { id: 'original_attribute_clock_association', name: 'Attribute: clock association', level: 3, status: 'removed', parent: 'original_class_Clock' },
    { id: 'original_attribute_hourHand', name: 'Attribute: hourHand', level: 3, status: 'unchanged', parent: 'original_class_Clock' },
    { id: 'original_attribute_minuteHand', name: 'Attribute: minuteHand', level: 3, status: 'unchanged', parent: 'original_class_Clock' },
    { id: 'original_operation_updateHands', name: 'Operation: updateHands', level: 3, status: 'unchanged', parent: 'original_class_Clock' },
    { id: 'original_operation_addOneHour', name: 'Operation: addOneHour', level: 3, status: 'unchanged', parent: 'original_class_Clock' },
    { id: 'original_operation_addOneMinute', name: 'Operation: addOneMinute', level: 3, status: 'unchanged', parent: 'original_class_Clock' },
    { id: 'original_operation_Clock', name: 'Operation: Clock (Constructor)', level: 3, status: 'unchanged', parent: 'original_class_Clock' },
    { id: 'original_class_Hand', name: 'Class: Hand', level: 2, status: 'unchanged', parent: 'original_package_Environment' },
    { id: 'original_attribute_hourHand_association', name: 'Attribute: hourHand association', level: 3, status: 'removed', parent: 'original_class_Hand' },
    { id: 'original_attribute_minuteHand_association', name: 'Attribute: minuteHand association', level: 3, status: 'removed', parent: 'original_class_Hand' },
    { id: 'original_stateMachine_ClockStateMachine', name: 'StateMachine: ClockStateMachine', level: 2, status: 'unchanged', parent: 'original_package_Environment' },
    { id: 'original_region_stateMachine', name: 'Region in state machine', level: 3, status: 'removed', parent: 'original_stateMachine_ClockStateMachine' },
    { id: 'original_pseudostate_Initial', name: 'Pseudostate: Initial', level: 4, status: 'unchanged', parent: 'original_region_stateMachine' },
    { id: 'original_state_Work', name: 'State: Work', level: 4, status: 'unchanged', parent: 'original_region_stateMachine' },
    { id: 'original_state_AddHour', name: 'State: AddHour', level: 4, status: 'unchanged', parent: 'original_region_stateMachine' },
    { id: 'original_transition_Initial_Work', name: 'Transition from Initial to Work', level: 4, status: 'unchanged', parent: 'original_region_stateMachine' },
    { id: 'original_transition_Work_AddHour', name: 'Transition from Work to AddHour', level: 4, status: 'unchanged', parent: 'original_region_stateMachine' },
    { id: 'original_transition_AddHour_Work', name: 'Transition from AddHour to Work', level: 4, status: 'unchanged', parent: 'original_region_stateMachine' },
    { id: 'original_association_Clock_ClockTower', name: 'Association: Clock and ClockTower', level: 2, status: 'unchanged', parent: 'original_package_Environment' },
    { id: 'original_association_Clock_Hand_hourHand', name: 'Association: Clock and Hand (hourHand)', level: 2, status: 'unchanged', parent: 'original_package_Environment' },
    { id: 'original_association_Clock_Hand_minuteHand', name: 'Association: Clock and Hand (minuteHand)', level: 2, status: 'unchanged', parent: 'original_package_Environment' }
  ];

  // Reconstructed model structure
  const reconstructedModel = [
    { id: 'reconstructed_model_ClockTower', name: 'Model: ClockTower', level: 0, status: 'added' },
    { id: 'reconstructed_package_Environment', name: 'Package: Environment', level: 1, status: 'unchanged', parent: 'reconstructed_model_ClockTower' },
    { id: 'reconstructed_class_ClockTower', name: 'Class: ClockTower', level: 2, status: 'unchanged', parent: 'reconstructed_package_Environment' },
    { id: 'reconstructed_attribute_clock', name: 'Attribute: clock', level: 3, status: 'unchanged', parent: 'reconstructed_class_ClockTower' },
    { id: 'reconstructed_class_Clock', name: 'Class: Clock', level: 2, status: 'unchanged', parent: 'reconstructed_package_Environment' },
    { id: 'reconstructed_attribute_currentHour', name: 'Attribute: currentHour', level: 3, status: 'unchanged', parent: 'reconstructed_class_Clock' },
    { id: 'reconstructed_attribute_currentMinute', name: 'Attribute: currentMinute', level: 3, status: 'unchanged', parent: 'reconstructed_class_Clock' },
    { id: 'reconstructed_attribute_hourHand', name: 'Attribute: hourHand', level: 3, status: 'unchanged', parent: 'reconstructed_class_Clock' },
    { id: 'reconstructed_attribute_minuteHand', name: 'Attribute: minuteHand', level: 3, status: 'unchanged', parent: 'reconstructed_class_Clock' },
    { id: 'reconstructed_operation_updateHands', name: 'Operation: updateHands', level: 3, status: 'unchanged', parent: 'reconstructed_class_Clock' },
    { id: 'reconstructed_operation_addOneHour', name: 'Operation: addOneHour', level: 3, status: 'unchanged', parent: 'reconstructed_class_Clock' },
    { id: 'reconstructed_operation_addOneMinute', name: 'Operation: addOneMinute', level: 3, status: 'unchanged', parent: 'reconstructed_class_Clock' },
    { id: 'reconstructed_operation_Clock', name: 'Operation: Clock (Constructor)', level: 3, status: 'unchanged', parent: 'reconstructed_class_Clock' },
    { id: 'reconstructed_class_Hand', name: 'Class: Hand', level: 2, status: 'unchanged', parent: 'reconstructed_package_Environment' },
    { id: 'reconstructed_stateMachine_ClockStateMachine', name: 'StateMachine: ClockStateMachine', level: 2, status: 'unchanged', parent: 'reconstructed_package_Environment' },
    { id: 'reconstructed_compositeState_top', name: 'CompositeState: top', level: 3, status: 'added', parent: 'reconstructed_stateMachine_ClockStateMachine' },
    { id: 'reconstructed_pseudostate_initial', name: 'Pseudostate: initial', level: 4, status: 'unchanged', parent: 'reconstructed_compositeState_top' },
    { id: 'reconstructed_state_Work', name: 'State: Work', level: 4, status: 'unchanged', parent: 'reconstructed_compositeState_top' },
    { id: 'reconstructed_action_updateHands', name: 'Action: updateHands', level: 5, status: 'added', parent: 'reconstructed_state_Work' },
    { id: 'reconstructed_state_AddHour', name: 'State: AddHour', level: 4, status: 'unchanged', parent: 'reconstructed_compositeState_top' },
    { id: 'reconstructed_action_addOneHour', name: 'Action: addOneHour', level: 5, status: 'added', parent: 'reconstructed_state_AddHour' },
    { id: 'reconstructed_transition_initial_Work', name: 'Transition: initial -> Work', level: 4, status: 'unchanged', parent: 'reconstructed_compositeState_top' },
    { id: 'reconstructed_transition_Work_AddHour', name: 'Transition: Work -> AddHour', level: 4, status: 'unchanged', parent: 'reconstructed_compositeState_top' },
    { id: 'reconstructed_transition_AddHour_Work', name: 'Transition: AddHour -> Work', level: 4, status: 'unchanged', parent: 'reconstructed_compositeState_top' },
    { id: 'reconstructed_association_Clock_Hand_hourHand', name: 'Association: Clock and Hand (hourHand)', level: 2, status: 'unchanged', parent: 'reconstructed_package_Environment' },
    { id: 'reconstructed_association_Clock_Hand_minuteHand', name: 'Association: Clock and Hand (minuteHand)', level: 2, status: 'unchanged', parent: 'reconstructed_package_Environment' },
    { id: 'reconstructed_association_ClockTower_Clock', name: 'Association: ClockTower and Clock', level: 2, status: 'unchanged', parent: 'reconstructed_package_Environment' }
  ];

  // Differences analysis
  const differences = {
    added: [
      { name: 'Model: ClockTower', description: 'Root model element was explicitly defined' },
      { name: 'CompositeState: top', description: 'Top composite state was added to state machine' },
      { name: 'Action: updateHands', description: 'Action was added to Work state' },
      { name: 'Action: addOneHour', description: 'Action was added to AddHour state' }
    ],
    removed: [
      { name: 'Profile: Mascaret', description: 'Mascaret profile was removed' },
      { name: 'Stereotype: Entity', description: 'Entity stereotype was removed' },
      { name: 'Attribute: clock association', description: 'Explicit association attribute was removed' },
      { name: 'Attribute: hourHand association', description: 'Explicit association attribute was removed' },
      { name: 'Attribute: minuteHand association', description: 'Explicit association attribute was removed' },
      { name: 'Region in state machine', description: 'Explicit region was removed and replaced with CompositeState: top' }
    ],
    modified: []
  };

  useEffect(() => {
    if (!svgRef.current) return;

    // Clear previous content
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 1200;
    const height = 900;
    const margin = { top: 20, right: 20, bottom: 20, left: 20 };
    const horizontalSpacing = 600; // Space between original and reconstructed models

    svg.attr('viewBox', `0 0 ${width} ${height}`);

    // Create container for zooming
    const container = svg.append('g');

    // Add zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on('zoom', (event) => {
        container.attr('transform', event.transform);
      });

    svg.call(zoom);
    
    // Initial zoom level
    svg.call(
      zoom.transform,
      d3.zoomIdentity.translate(margin.left, margin.top).scale(0.8)
    );

    // Create and position the nodes
    if (showOriginal) {
      createModelTree(container, originalModel, 0, 'Original Model');
    }
    
    if (showReconstructed) {
      createModelTree(container, reconstructedModel, horizontalSpacing, 'Reconstructed Model');
    }

    // Create legend
    createLegend(svg, width - 200, 30);

    // Create differences list
    if (showOriginal && showReconstructed) {
      createDifferencesList(svg, width / 2 - 300, height - 170);
    }

  }, [showOriginal, showReconstructed]);

  // Function to create a model tree visualization
  const createModelTree = (
    container: d3.Selection<SVGGElement, unknown, null, undefined>,
    model: any[],
    xOffset: number,
    title: string
  ) => {
    // Add title
    container
      .append('text')
      .attr('x', xOffset + 175)
      .attr('y', 30)
      .attr('text-anchor', 'middle')
      .attr('font-size', '18px')
      .attr('font-weight', 'bold')
      .text(title);

    // Create nodes
    model.forEach((node, i) => {
      const parentNode = model.find(n => n.id === node.parent);
      
      // Calculate position based on level and index
      const y = 60 + i * 35;
      const x = xOffset + node.level * 20;
      
      // Calculate node width based on level
      const nodeWidth = nodeWidthBase - node.level * 10;
      
      // Create node group
      const nodeGroup = container.append('g')
        .attr('transform', `translate(${x}, ${y})`);
      
      // Create rectangle for node
      nodeGroup
        .append('rect')
        .attr('width', nodeWidth)
        .attr('height', nodeHeight)
        .attr('rx', 5)
        .attr('ry', 5)
        .attr('fill', 'white')
        .attr('stroke', getStatusColor(node.status))
        .attr('stroke-width', 2);
      
      // Add text label
      nodeGroup
        .append('text')
        .attr('x', 10)
        .attr('y', nodeHeight / 2 + 5)
        .attr('fill', getStatusColor(node.status))
        .text(node.name);
      
      // Draw line to parent if it exists
      if (parentNode) {
        const lineStartX = x;
        const lineStartY = y + nodeHeight / 2;
        const lineEndX = xOffset + parentNode.level * 20 + 5;
        const lineEndY = 60 + model.indexOf(parentNode) * 35 + nodeHeight / 2;
        
        container
          .append('path')
          .attr('d', `M${lineStartX},${lineStartY} L${lineStartX - 10},${lineStartY} L${lineStartX - 10},${lineEndY} L${lineEndX},${lineEndY}`)
          .attr('fill', 'none')
          .attr('stroke', getStatusColor(node.status))
          .attr('stroke-width', 1)
          .attr('stroke-dasharray', node.status === 'unchanged' ? '0' : '3,3');
      }
    });
  };

  // Function to create a legend
  const createLegend = (
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    x: number,
    y: number
  ) => {
    const legend = svg.append('g')
      .attr('transform', `translate(${x}, ${y})`);
    
    legend.append('rect')
      .attr('width', 180)
      .attr('height', 110)
      .attr('fill', 'white')
      .attr('stroke', '#ddd')
      .attr('rx', 5)
      .attr('ry', 5);
    
    const items = [
      { label: 'Added', color: colors.added },
      { label: 'Removed', color: colors.removed },
      { label: 'Modified', color: colors.modified },
      { label: 'Unchanged', color: colors.unchanged }
    ];
    
    items.forEach((item, i) => {
      const g = legend.append('g')
        .attr('transform', `translate(10, ${10 + i * 25})`);
      
      g.append('rect')
        .attr('width', 20)
        .attr('height', 20)
        .attr('fill', 'white')
        .attr('stroke', item.color)
        .attr('stroke-width', 2)
        .attr('rx', 3)
        .attr('ry', 3);
      
      g.append('text')
        .attr('x', 30)
        .attr('y', 15)
        .attr('fill', item.color)
        .text(item.label);
    });
  };

  // Function to create a list of differences
  const createDifferencesList = (
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    x: number,
    y: number
  ) => {
    const differencesList = svg.append('g')
      .attr('transform', `translate(${x}, ${y})`);
    
    // Background
    differencesList.append('rect')
      .attr('width', 600)
      .attr('height', 150)
      .attr('fill', 'white')
      .attr('stroke', '#ddd')
      .attr('rx', 5)
      .attr('ry', 5);
    
    // Title
    differencesList.append('text')
      .attr('x', 10)
      .attr('y', 20)
      .attr('font-weight', 'bold')
      .text('Differences Summary:');
    
    // Added elements
    differencesList.append('text')
      .attr('x', 10)
      .attr('y', 40)
      .attr('fill', colors.added)
      .text('Added:');
    
    differences.added.forEach((item, i) => {
      differencesList.append('text')
        .attr('x', 80)
        .attr('y', 40 + i * 18)
        .attr('font-size', '12px')
        .attr('fill', colors.added)
        .text(`${item.name} - ${item.description}`);
    });
    
    // Removed elements
    differencesList.append('text')
      .attr('x', 10)
      .attr('y', 40 + differences.added.length * 18 + 10)
      .attr('fill', colors.removed)
      .text('Removed:');
    
    differences.removed.forEach((item, i) => {
      differencesList.append('text')
        .attr('x', 80)
        .attr('y', 40 + differences.added.length * 18 + 10 + i * 18)
        .attr('font-size', '12px')
        .attr('fill', colors.removed)
        .text(`${item.name} - ${item.description}`);
    });
  };

  // Helper function to get color based on status
  const getStatusColor = (status: string): string => {
    return colors[status as keyof typeof colors] || colors.unchanged;
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-grow overflow-hidden">
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          className="w-full h-full"
        />
      </div>
      <div className="p-4 text-sm text-gray-500">
        Use mouse wheel to zoom and drag to pan. The visualization shows the differences between 
        the original XMI model and the reconstructed model.
      </div>
    </div>
  );
};

export default ClockTowerComparison; 