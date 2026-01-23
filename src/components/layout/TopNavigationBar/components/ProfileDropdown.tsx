import avatar1 from '@/assets/images/users/avatar-1.jpg'
import IconifyIcon from '@/components/wrapper/IconifyIcon'
import { useAuthContext } from '@/context/useAuthContext'
import { Dropdown, DropdownHeader, DropdownItem, DropdownMenu, DropdownToggle } from 'react-bootstrap'

const ProfileDropdown = () => {
  const { signOut } = useAuthContext()

  return (
    <Dropdown className=" topbar-item">
      <DropdownToggle
        type="button"
        className="topbar-button content-none"
        id="page-header-user-dropdown"
        data-bs-toggle="dropdown"
        aria-haspopup="true"
        aria-expanded="false">
        <span className="d-flex align-items-center">
          <img
            className="rounded-circle"
            width={32}
            src={avatar1}
            alt="avatar-3"
          />
        </span>
      </DropdownToggle>
      <DropdownMenu className=" dropdown-menu-end">
        <DropdownHeader>Welcome!</DropdownHeader>
        <div className="dropdown-divider my-1" />
        <DropdownItem className=" text-danger" onClick={signOut} style={{ cursor: 'pointer' }}>
          <IconifyIcon icon="solar:logout-3-outline" className="align-middle me-2 fs-18" />
          <span className="align-middle">
            Logout
          </span>
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  )
}

export default ProfileDropdown
