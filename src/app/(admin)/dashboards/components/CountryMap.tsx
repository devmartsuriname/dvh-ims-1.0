import WorldVectorMap from '@/components/VectorMap/WorldMap'
import IconifyIcon from '@/components/wrapper/IconifyIcon'
import { Card, CardBody, CardHeader, Col, Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from 'react-bootstrap'
import { useDistrictApplications, SURINAME_DISTRICTS } from '../hooks/useDashboardData'

const CountryMap = () => {
  const { data: districtData, loading } = useDistrictApplications()

  // Build markers from real district data
  const markers = loading 
    ? SURINAME_DISTRICTS.map(d => ({ name: d.name, coords: d.coords }))
    : districtData
        .filter(d => d.count > 0)
        .map(d => ({ 
          name: `${d.districtName}: ${d.count} applications`, 
          coords: d.coords 
        }))

  // If no data, show at least Paramaribo as default marker
  const displayMarkers = markers.length > 0 
    ? markers 
    : [{ name: 'Paramaribo', coords: [5.852, -55.203] }]

  const salesLocationOptions = {
    map: 'world',
    zoomOnScroll: false,
    zoomButtons: false,
    draggable: false,
    markersSelectable: true,
    focusOn: {
      region: 'SR',
      scale: 15,
      animate: false,
    },
    selectedRegions: ['SR'],
    markers: displayMarkers,
    markerStyle: {
      initial: { fill: '#7f56da' },
      selected: { fill: '#1bb394' },
    },
    labels: {
      markers: {},
    },
    regionStyle: {
      initial: {
        fill: 'rgba(169,183,197, 0.3)',
        fillOpacity: 1,
      },
      selected: {
        fill: '#7f56da',
        fillOpacity: 0.8,
      },
    },
  }

  return (
    <>
      <Col lg={4}>
        <Card className=" card-height-100">
          <CardHeader className="d-flex  justify-content-between align-items-center border-bottom border-dashed">
            <h4 className="card-title mb-0">Applications by District</h4>
            <Dropdown>
              <DropdownToggle variant="secondary" className=" btn btn-sm btn-outline-light content-none">
                View Data <IconifyIcon icon="bx:bx-chevron-down" style={{ marginLeft: '5px', fontSize: '16px' }} />
              </DropdownToggle>
              <DropdownMenu className=" dropdown-menu-end">
                <DropdownItem href="">Download</DropdownItem>
                <DropdownItem href="">Export</DropdownItem>
                <DropdownItem href="">Import</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </CardHeader>
          <CardBody className="pt-0">
            <div id="world-map-markers" className="mt-3" style={{ height: '309px' }}>
              <WorldVectorMap height="300px" width="100%" options={salesLocationOptions} />
            </div>
          </CardBody>
        </Card>
      </Col>
    </>
  )
}

export default CountryMap
