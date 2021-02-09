package main

import (
	"nebula/router"
	"nebula/server"
	"nebula/user"
	"net/http"

	"golang.org/x/net/websocket"
)

// LoginResponse .
type LoginResponse struct {
	User    *user.User       `json:"user"`
	Servers []*server.Server `json:"servers"`
}

// ServerRequest .
type ServerRequest struct {
	ServerID  int            `json:"serverID"`
	ChannelID int            `json:"channelID"`
	Channel   server.Channel `json:"channel"`
	Role      server.Role    `json:"role"`
	Roles     []server.Role  `json:"roles"`
}

func socket(ws *websocket.Conn) {
	cookie, err := ws.Request().Cookie("Auth")
	if err != nil {
		defer ws.Close()
	} else {
		user, _ := user.GetSession((cookie.Value))
		server.AddConnection(user.ID, ws)
		// if err := websocket.JSON.Send(ws, loginResponse); err != nil {
		// 	fmt.Println("unable to send")
		// 	defer ws.Close()
		// }
	}

}

func init() {

	r := router.NewGroup()

	r.Post("/ws", func(w http.ResponseWriter, r *http.Request, c *router.Context) {
		s := websocket.Handler(socket)
		s.ServeHTTP(w, r)
	})

	r.Get("/test-websocket", func(w http.ResponseWriter, r *http.Request, c *router.Context) {
		u := c.Keys["user"].(*user.User)
		server.SendMessage(u.ID, "Lo")
	})

}
