# Seating

Shared geometry for the isometric group, not a part on its own. The parts are listed in `../components.md`.

**`y_base = y_plane_top + D/2`.** An object's base line sits at the vertical middle of its plane's depth band, verified to within 4px on every object in the source figure.

This is the whole trick. The depth band **brackets** the base, so the far half of the plane hides behind the object and the near half runs in front of it and stays visible below. A base on the back edge floats. A base on the front edge looks glued to the lip. Only the middle rests.

**Paint every object after every plane.** For `c-iso-cube`, `y_base` is `use.y + 122`, so `use.y = y_plane_top + D/2 - 122`. For a cylinder it is the lowest point of the bottom arc, `top_ellipse_centre + body + ry`.
