package com.nextrole.controller;

import com.nextrole.config.AppProperties;
import com.nextrole.config.CorsConfig;
import com.nextrole.config.SecurityConfig;
import com.nextrole.controller.admin.AdminController;
import com.nextrole.dto.admin.AdminStatsDto;
import com.nextrole.service.AdminService;
import com.nextrole.service.CompanyService;
import com.nextrole.service.SyncService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = AdminController.class)
@Import({SecurityConfig.class, CorsConfig.class, AppProperties.class})
@ActiveProfiles("test")
class AdminControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AdminService adminService;
    @MockBean
    private CompanyService companyService;
    @MockBean
    private SyncService syncService;
    @MockBean
    private com.nextrole.service.EmployerJobService employerJobService;

    @Test
    @DisplayName("Unauthenticated visitor cannot access admin endpoints (401 Unauthorized)")
    void testUnauthenticatedBlocked() throws Exception {
        mockMvc.perform(get("/api/admin/stats"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    @DisplayName("Authenticated ADMIN can access admin stats (200 OK)")
    void testAuthenticatedAdminAllowed() throws Exception {
        AdminStatsDto stats = new AdminStatsDto(100, 90, 10, 5, 8, 8, 4, 4);
        when(adminService.getStats()).thenReturn(stats);

        mockMvc.perform(get("/api/admin/stats"))
                .andExpect(status().isOk());
    }
}
