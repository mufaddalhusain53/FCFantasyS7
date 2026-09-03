import { supabase } from "./supabaseClient";
import { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import "./App.css";

function App() {
  // =========================================================
  // PLAYER DATA
  // =========================================================

  const [players, setPlayers] = useState([]);
  const [loadingPlayers, setLoadingPlayers] = useState(true);
  const [playerLoadError, setPlayerLoadError] = useState("");
  const [teamEditingAllowed, setTeamEditingAllowed] =
  useState(false);

const [teamDeadline, setTeamDeadline] =
  useState(null);

const [settingsLoading, setSettingsLoading] =
  useState(false);

const [adminDeadlineInput, setAdminDeadlineInput] =
  useState("");

  useEffect(() => {
  const loadPlayers = async () => {
    try {
      setLoadingPlayers(true);
      setPlayerLoadError("");

      const { data, error } = await supabase
  .from("players")
  .select(`
    id,
    player_number,
    name,
    real_team,
    role,
    selection_points,
    image,
    auction_points,
    player_points (
      fantasy_points
    )
  `)
  .order("selection_points", {
    ascending: false,
  });

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        throw new Error(
          "No players were found in the Supabase database."
        );
      }

      const formattedPlayers = data.map((player) => ({
        // FC Player Number remains the primary player ID
        id: String(player.player_number)
          .trim()
          .padStart(3, "0"),

        name: String(player.name || "").trim(),

        team: String(player.real_team || "").trim(),

        role: String(player.role || "").trim(),

        cost:
          Number(player.selection_points) || 0,

        image:
          String(player.image || "").trim(),

        auctionPoints:
          Number(player.auction_points) || 0,

        // Fantasy points will come from player_points later
        points:
          Number(
            player.player_points?.[0]?.fantasy_points
          ) || 0,

        // Keep Supabase UUID available for database operations
        databaseId: player.id,
      }));

      if (!formattedPlayers.length) {
        throw new Error(
          "No valid players were found in the Supabase database."
        );
      }

      setPlayers(formattedPlayers);

      // Demo participants are intentionally removed.
      // Participants will come from Supabase.

      console.log(
        `Successfully loaded ${formattedPlayers.length} players from Supabase.`
      );
    } catch (error) {
      console.error(
        "Supabase player loading error:",
        error
      );

      setPlayerLoadError(
        error.message ||
          "Unable to load players from Supabase."
      );
    } finally {
      setLoadingPlayers(false);
    }
  };

  loadPlayers();
}, []);

  // =========================================================
  // FANTASY SETTINGS
  // =========================================================

  const loadFantasySettings = async () => {
    try {
      setSettingsLoading(true);

      const { data, error } = await supabase.rpc(
        "get_fantasy_settings"
      );

      if (error) throw error;
      if (!data?.success) {
        throw new Error("Unable to load Fantasy settings.");
      }

      setTeamEditingAllowed(
        Boolean(data.team_editing_allowed)
      );
      setTeamDeadline(
        data.team_deadline || null
      );

      if (data.team_deadline) {
        const date = new Date(data.team_deadline);
        const localValue = new Date(
          date.getTime() -
            date.getTimezoneOffset() * 60000
        )
          .toISOString()
          .slice(0, 16);

        setAdminDeadlineInput(localValue);
      } else {
        setAdminDeadlineInput("");
      }
    } catch (error) {
      console.error(
        "Fantasy settings loading error:",
        error
      );
    } finally {
      setSettingsLoading(false);
    }
  };

  useEffect(() => {
    loadFantasySettings();
  }, []);

  // =========================================================
  // APP STATE
  // =========================================================

  const [screen, setScreen] = useState("login");

  const [mobile, setMobile] = useState("");

  const [pin, setPin] = useState("");

  const [confirmPin, setConfirmPin] = useState("");

  const [name, setName] = useState("");

  const [fantasyName, setFantasyName] = useState("");

  const [currentUserId, setCurrentUserId] =
  useState(null);

  const [
    currentFantasyTeamId,
    setCurrentFantasyTeamId,
  ] = useState(null);

  const [authLoading, setAuthLoading] = useState(false);

  const [authError, setAuthError] = useState("");

  const [selected, setSelected] = useState([]);

  const [captain, setCaptain] = useState(null);

  const [vice, setVice] = useState(null);

  const [savedTeamPlayers, setSavedTeamPlayers] = useState([]);

  const [savedTeamLoading, setSavedTeamLoading] = useState(false);

  const [search, setSearch] = useState("");

  const [filter, setFilter] = useState("ALL");

  // =========================================================
  // ADMIN / MATCH POINT IMPORT
  // =========================================================

  const [adminPin, setAdminPin] = useState("");
  const [adminSearch, setAdminSearch] = useState("");
  const [adminTeamFilter, setAdminTeamFilter] = useState("ALL");
  const [adminImportRows, setAdminImportRows] = useState([]);
  const [adminImportErrors, setAdminImportErrors] = useState([]);
  const [adminFileName, setAdminFileName] = useState("");
  const [publishedPoints, setPublishedPoints] = useState({});
  const [adminParticipants, setAdminParticipants] = useState([]);
  const [liveParticipants, setLiveParticipants] = useState([]);
  const [participantDataLoading, setParticipantDataLoading] = useState(false);
  const [participantDataError, setParticipantDataError] = useState("");
  const [editingParticipantId, setEditingParticipantId] = useState(null);
  const [adminTeamName, setAdminTeamName] = useState("");
  const [adminTeamPlayers, setAdminTeamPlayers] = useState([]);
  const [adminCaptain, setAdminCaptain] = useState(null);
  const [adminVice, setAdminVice] = useState(null);
  const [adminLeaderboardTeam, setAdminLeaderboardTeam] = useState("ALL");
  const [adminLeaderboardSearch, setAdminLeaderboardSearch] = useState("");
  const [showImportPreview, setShowImportPreview] = useState(false);
  const [showPlayerLeaderboard, setShowPlayerLeaderboard] = useState(true);
  const [showParticipantDashboard, setShowParticipantDashboard] = useState(true);
  const [showParticipantManager, setShowParticipantManager] = useState(false);
  const [openUserParticipantId, setOpenUserParticipantId] = useState(null);


  // =========================================================
  // TEAM LOGOS
  // =========================================================

  const teamLogos = {
    "SHABBIR LIONS": "/team-logos/shabbir-lions.png",
    "ULCC": "/team-logos/ulcc.png",
    "UNIX STARS": "/team-logos/unix-stars.png",
    "VISTA VIKINGS": "/team-logos/vista-vikings.png",
    "EZZI UNITED": "/team-logos/ezzi-united.png",
    "JOLLY CRICKETERS": "/team-logos/jolly-cricketers.png",
    "MULTIPLIZE HIGHLANDERS": "/team-logos/multiplize-highlanders.png",
    "SAIFEE STAR": "/team-logos/saifee-star.png",
  };


  // =========================================================
  // SELECTED PLAYERS
  // =========================================================

  const selectedPlayers = useMemo(
    () =>
      players.filter((player) =>
        selected.includes(player.id)
      ),
    [players, selected]
  );

  // =========================================================
  // BUDGET
  // =========================================================

  const budget = selectedPlayers.reduce(
    (sum, player) => sum + player.cost,
    0
  );

  // =========================================================
  // TEAM COUNTS
  // =========================================================

  const counts = selectedPlayers.reduce(
    (acc, player) => {
      acc[player.team] =
        (acc[player.team] || 0) + 1;

      return acc;
    },
    {}
  );

  // =========================================================
  // TEAM FILTER
  // =========================================================

  const teams = useMemo(() => {
    return [
      ...new Set(
        players.map((player) => player.team)
      ),
    ]
      .filter(Boolean)
      .sort();
  }, [players]);

  // =========================================================
  // SEARCH / FILTER
  // =========================================================

  const filtered = useMemo(() => {
    const searchText =
      search.toLowerCase().trim();

    return players.filter((player) => {
      const matchesTeam =
        filter === "ALL" ||
        player.team === filter;

      const matchesSearch =
        !searchText ||
        `${player.name} ${player.team} ${player.role}`
          .toLowerCase()
          .includes(searchText);

      return (
        matchesTeam && matchesSearch
      );
    });
  }, [players, filter, search]);

  // =========================================================
// AUTHENTICATION
// =========================================================

const resetAuthFields = () => {
  setPin("");
  setConfirmPin("");
  setAuthError("");
};

const isDeadlinePassed =
  Boolean(teamDeadline) &&
  new Date() >= new Date(teamDeadline);

const canEditTeam =
  Boolean(teamEditingAllowed) &&
  !isDeadlinePassed;

// New registrations are allowed only while team editing is ON and
// the submission deadline has not passed.
const isRegistrationClosed =
  !teamEditingAllowed ||
  isDeadlinePassed;

// Other participants become visible only after the deadline has passed
// AND the admin has turned team editing OFF.
const isLeaderboardPublic =
  isDeadlinePassed &&
  !teamEditingAllowed;

const formattedDeadline = teamDeadline
  ? new Date(teamDeadline).toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    )
  : null;

const logoutParticipant = () => {
  // Clear participant login/session data
  setMobile("");
  setPin("");
  setConfirmPin("");
  setName("");
  setFantasyName("");

  setCurrentUserId(null);
  setCurrentFantasyTeamId(null);

  // Clear current fantasy team state
  setSelected([]);
  setCaptain(null);
  setVice(null);
  setSavedTeamPlayers([]);

  // Clear temporary states
  setAuthError("");
  setAuthLoading(false);
  setSavedTeamLoading(false);

  // Return to participant login
  setScreen("login");
};


// =========================================================
// SIGN IN
// =========================================================

const signIn = async () => {
  setAuthError("");

  if (!/^\d{10}$/.test(mobile)) {
    setAuthError(
      "Enter a valid 10-digit mobile number."
    );
    return;
  }

  if (!/^\d{4,6}$/.test(pin)) {
    setAuthError(
      "PIN must contain 4 to 6 digits."
    );
    return;
  }

  try {
    setAuthLoading(true);

    const { data, error } = await supabase.rpc(
      "login_user",
      {
        p_mobile: `+91${mobile}`,
        p_pin: pin,
      }
    );

    if (error) {
      throw error;
    }

    if (!data || !data.success) {
      throw new Error(
        "Invalid mobile number or PIN."
      );
    }

    // Store logged-in participant information
    setName(data.name);
    setFantasyName(data.team_name);

    // Keep the user's database IDs available
    // for the next stages of the app.
    setCurrentUserId(data.user_id);
    setCurrentFantasyTeamId(
    data.fantasy_team_id
  );

  const hasSavedTeam =
    await loadMyFantasyTeam(
      data.fantasy_team_id,
      mobile,
      pin
    );

  if (hasSavedTeam) {
    setScreen("dashboard");
  } else {
    setSelected([]);
    setCaptain(null);
    setVice(null);
    setScreen("select");
  }
  } catch (error) {
    console.error(
      "Sign in error:",
      error
    );

    setAuthError(
      error.message ||
        "Unable to sign in. Please check your mobile number and PIN."
    );
  } finally {
    setAuthLoading(false);
  }
};


// =========================================================
// REGISTER
// =========================================================

const register = async () => {
  setAuthError("");

  if (settingsLoading) {
    setAuthError("Please wait while Fantasy registration status is loading.");
    return;
  }

  if (isRegistrationClosed) {
    setAuthError(
      isDeadlinePassed
        ? "Fantasy registration is closed because the submission deadline has passed."
        : "Fantasy registration is currently closed by the admin."
    );
    return;
  }

  if (!name.trim()) {
    setAuthError("Enter your name.");
    return;
  }

  if (!fantasyName.trim()) {
    setAuthError(
      "Enter your Fantasy Team Name."
    );
    return;
  }

  if (!/^\d{10}$/.test(mobile)) {
    setAuthError(
      "Enter a valid 10-digit mobile number."
    );
    return;
  }

  if (!/^\d{4,6}$/.test(pin)) {
    setAuthError(
      "PIN must contain 4 to 6 digits."
    );
    return;
  }

  if (pin !== confirmPin) {
    setAuthError(
      "PIN and Confirm PIN do not match."
    );
    return;
  }

  try {
    setAuthLoading(true);

    const { data, error } = await supabase.rpc(
      "register_user",
      {
        p_mobile: `+91${mobile}`,
        p_name: name.trim(),
        p_team_name: fantasyName.trim(),
        p_pin: pin,
      }
    );

    if (error) {
      throw error;
    }

    if (!data || !data.success) {
      throw new Error(
        "Unable to create your account."
      );
    }

    // Store logged-in participant information
    setCurrentUserId(data.user_id);
    setCurrentFantasyTeamId(
      data.fantasy_team_id
    );

    setName(data.name);
    setFantasyName(data.team_name);

    // New users need to build their XI
    setScreen("select");
  } catch (error) {
    console.error(
      "Registration error:",
      error
    );

    setAuthError(
      error.message ||
        "Unable to create your account."
    );
  } finally {
    setAuthLoading(false);
  }
};

const loadMyFantasyTeam = async (
  teamId = currentFantasyTeamId,
  userMobile = mobile,
  userPin = pin
) => {
  if (!teamId || !userMobile || !userPin) {
    return false;
  }

  try {
    setSavedTeamLoading(true);

    const { data, error } = await supabase.rpc(
      "get_my_fantasy_team",
      {
        p_mobile: `+91${userMobile}`,
        p_pin: userPin,
        p_fantasy_team_id: teamId,
      }
    );

    if (error) {
      throw error;
    }

    const formattedTeam = (data || []).map((player) => ({
      id: String(player.player_number)
        .trim()
        .padStart(3, "0"),

      name: String(player.player_name || "").trim(),

      team: String(player.real_team || "").trim(),

      role: String(player.role || "").trim(),

      cost:
        Number(player.selection_points) || 0,

      image:
        String(player.image || "").trim(),

      points:
        Number(player.fantasy_points) || 0,

      databaseId: player.player_id,

      isCaptain:
        Boolean(player.is_captain),

      isViceCaptain:
        Boolean(player.is_vice_captain),
    }));

    setSavedTeamPlayers(formattedTeam);

    // Keep the existing selection state synchronized
    setSelected(
      formattedTeam.map((player) => player.id)
    );

    setCaptain(
      formattedTeam.find(
        (player) => player.isCaptain
      )?.id || null
    );

    setVice(
      formattedTeam.find(
        (player) => player.isViceCaptain
      )?.id || null
    );

    console.log(
      `Loaded ${formattedTeam.length} saved fantasy players from Supabase.`
    );

    return formattedTeam.length === 11;

  } catch (error) {
    console.error(
      "Load fantasy team error:",
      error
    );

    setSavedTeamPlayers([]);
    setSelected([]);
    setCaptain(null);
    setVice(null);

    return false;

  } finally {
    setSavedTeamLoading(false);
  }
};

  // =========================================================
  // PLAYER SELECTION
  // =========================================================

  const toggle = (player) => {
    const isSelected =
      selected.includes(player.id);

    // Remove player
    if (isSelected) {
      setSelected(
        selected.filter(
          (id) => id !== player.id
        )
      );

      if (captain === player.id) {
        setCaptain(null);
      }

      if (vice === player.id) {
        setVice(null);
      }

      return;
    }

    // Maximum 11 players
    if (selected.length >= 11) {
      alert(
        "You can select only 11 players."
      );
      return;
    }

    // Budget
    if (budget + player.cost > 100) {
      alert(
        "You have exceeded the 100 Selection Points budget."
      );
      return;
    }

    // Maximum 3 players per real team
    if (
      (counts[player.team] || 0) >= 3
    ) {
      alert(
        "Maximum 3 players allowed from one team."
      );
      return;
    }

    setSelected([
      ...selected,
      player.id,
    ]);
  };

  // =========================================================
  // CAPTAIN
  // =========================================================

  const selectCaptain = (playerId) => {
    if (vice === playerId) {
      setVice(null);
    }

    setCaptain(playerId);
  };

  // =========================================================
  // VICE CAPTAIN
  // =========================================================

  const selectVice = (playerId) => {
    if (captain === playerId) {
      setCaptain(null);
    }

    setVice(playerId);
  };

  // =========================================================
  // SUBMIT TEAM
  // =========================================================

  const submit = async () => {
  // ==========================================
  // DEADLINE / EDITING VALIDATION
  // ==========================================

  if (isDeadlinePassed) {
    alert(
      "The Fantasy Team submission deadline has passed."
    );
    return;
  }

  if (
    savedTeamPlayers.length === 11 &&
    !teamEditingAllowed
  ) {
    alert(
      "Team editing is currently disabled by the admin."
    );
    return;
  }

  // ==========================================
  // BASIC VALIDATION
  // ==========================================

  if (selected.length !== 11) {
    alert(
      "Your Fantasy XI must contain exactly 11 players."
    );
    return;
  }

  if (!captain || !vice) {
    alert(
      "Select Captain and Vice Captain."
    );
    return;
  }

  if (captain === vice) {
    alert(
      "Captain and Vice Captain must be different."
    );
    return;
  }

  if (!currentFantasyTeamId) {
    alert(
      "Fantasy team information is missing. Please sign in again."
    );
    return;
  }

  if (!mobile || !pin) {
    alert(
      "Your login session is missing. Please sign in again."
    );
    return;
  }

  // ==========================================
  // FIND SELECTED PLAYER DATABASE UUIDs
  // ==========================================

  const selectedPlayerObjects = players.filter(
    (player) =>
      selected.includes(player.id)
  );

  const playerDatabaseIds =
    selectedPlayerObjects.map(
      (player) => player.databaseId
    );

  // Make sure every player has a Supabase UUID
  if (
    playerDatabaseIds.length !== 11 ||
    playerDatabaseIds.some((id) => !id)
  ) {
    alert(
      "Unable to identify one or more selected players. Please refresh and try again."
    );
    return;
  }

  // ==========================================
  // FIND CAPTAIN / VC DATABASE UUIDs
  // ==========================================

  const captainPlayer = players.find(
    (player) => player.id === captain
  );

  const viceCaptainPlayer = players.find(
    (player) => player.id === vice
  );

  if (
    !captainPlayer?.databaseId ||
    !viceCaptainPlayer?.databaseId
  ) {
    alert(
      "Unable to identify Captain or Vice Captain. Please refresh and try again."
    );
    return;
  }

  // ==========================================
  // SAVE TO SUPABASE
  // ==========================================

  try {
    setAuthLoading(true);
    setAuthError("");

    const { data, error } =
      await supabase.rpc(
        "save_fantasy_team",
        {
          p_mobile: `+91${mobile}`,
          p_pin: pin,
          p_fantasy_team_id:
            currentFantasyTeamId,
          p_player_ids:
            playerDatabaseIds,
          p_captain_id:
            captainPlayer.databaseId,
          p_vice_captain_id:
            viceCaptainPlayer.databaseId,
        }
      );

    if (error) {
      throw error;
    }

    console.log(
      "Fantasy team saved successfully:",
      data
    );

    alert(
      "Your Fantasy XI has been saved successfully!"
    );

    setScreen("dashboard");

  } catch (error) {

    console.error(
      "Fantasy team save error:",
      error
    );

    alert(
      error.message ||
        "Unable to save your Fantasy XI."
    );

  } finally {
    setAuthLoading(false);
  }
};

  // =========================================================
  // LIVE PARTICIPANT / LEADERBOARD DATA
  // =========================================================

  const loadPublicLeaderboard = async () => {
    try {
      setParticipantDataLoading(true);
      setParticipantDataError("");

      console.log("Loading participant leaderboard from Supabase...");

      const { data, error } = await supabase.rpc(
        "get_public_leaderboard",
        { p_admin_pin: adminPin }
      );

      if (error) throw error;

      console.log(
        `Supabase returned ${Array.isArray(data) ? data.length : 0} participant player rows.`
      );

      const grouped = {};

      (Array.isArray(data) ? data : []).forEach((row) => {
        const teamId = row.fantasy_team_id;
        if (!teamId) return;

        if (!grouped[teamId]) {
          grouped[teamId] = {
            id: teamId,
            teamName: String(row.team_name || "").trim(),
            name: String(row.participant_name || "").trim(),
            playerIds: [],
            captain: null,
            vice: null,
            players: [],
            totalPoints: 0,
          };
        }

        const participant = grouped[teamId];
        const playerId = String(row.player_number || "")
          .trim()
          .padStart(3, "0");
        const basePoints = Number(row.fantasy_points) || 0;

        // Prevent duplicate player rows from appearing in the same Fantasy Team.
        if (!participant.playerIds.includes(playerId)) {
          participant.playerIds.push(playerId);
          participant.players.push({
            id: playerId,
            name: String(row.player_name || "").trim(),
            team: String(row.real_team || "").trim(),
            role: String(row.role || "").trim(),
            cost: Number(row.selection_points) || 0,
            image: String(row.image || "").trim(),
            points: basePoints,
            databaseId: row.player_id,
          });

          if (row.is_captain) {
            participant.captain = playerId;
          }

          if (row.is_vice_captain) {
            participant.vice = playerId;
          }

          if (row.is_captain) {
            participant.totalPoints += basePoints * 2;
          } else if (row.is_vice_captain) {
            participant.totalPoints += basePoints * 1.5;
          } else {
            participant.totalPoints += basePoints;
          }
        }
      });

      const rows = Object.values(grouped)
        .filter((participant) => participant.playerIds.length > 0)
        .sort(
          (a, b) =>
            b.totalPoints - a.totalPoints ||
            a.teamName.localeCompare(b.teamName)
        )
        .map((participant, index) => ({
          ...participant,
          rank: index + 1,
        }));

      console.log(
        `Grouped Supabase data into ${rows.length} Fantasy Teams.`
      );
      console.log("Fantasy Teams:", rows);

      setLiveParticipants(rows);
      setAdminParticipants(rows);

      const current = rows.find(
        (participant) => participant.id === currentFantasyTeamId
      );

      if (current) {
        setFantasyName(current.teamName);
      }
    } catch (error) {
      console.error(
        "Participant leaderboard loading error:",
        error
      );
      setLiveParticipants([]);
      setAdminParticipants([]);
      setParticipantDataError(
        error?.message || "Unable to load participant data from Supabase."
      );
    } finally {
      setParticipantDataLoading(false);
    }
  };

  // Participant leaderboard loader. This RPC is privacy-aware on the
  // database side, so the browser never receives other teams before the
  // leaderboard is unlocked.
  const loadParticipantLeaderboard = async () => {
    if (!mobile || !pin || !currentFantasyTeamId) return;

    try {
      setParticipantDataLoading(true);
      setParticipantDataError("");

      const { data, error } = await supabase.rpc(
        "get_participant_leaderboard",
        {
          p_mobile: `+91${mobile}`,
          p_pin: pin,
        }
      );

      if (error) throw error;

      const grouped = {};

      (Array.isArray(data) ? data : []).forEach((row) => {
        const teamId = row.fantasy_team_id;
        if (!teamId) return;

        if (!grouped[teamId]) {
          grouped[teamId] = {
            id: teamId,
            teamName: String(row.team_name || "").trim(),
            name: String(row.participant_name || "").trim(),
            playerIds: [],
            captain: null,
            vice: null,
            players: [],
            totalPoints: 0,
          };
        }

        const participant = grouped[teamId];
        const playerId = String(row.player_number || "")
          .trim()
          .padStart(3, "0");
        const basePoints = Number(row.fantasy_points) || 0;

        if (participant.playerIds.includes(playerId)) return;

        participant.playerIds.push(playerId);
        participant.players.push({
          id: playerId,
          name: String(row.player_name || "").trim(),
          team: String(row.real_team || "").trim(),
          role: String(row.role || "").trim(),
          cost: Number(row.selection_points) || 0,
          image: String(row.image || "").trim(),
          points: basePoints,
          databaseId: row.player_id,
        });

        if (row.is_captain) {
          participant.captain = playerId;
          participant.totalPoints += basePoints * 2;
        } else if (row.is_vice_captain) {
          participant.vice = playerId;
          participant.totalPoints += basePoints * 1.5;
        } else {
          participant.totalPoints += basePoints;
        }
      });

      const rows = Object.values(grouped)
        .sort(
          (a, b) =>
            b.totalPoints - a.totalPoints ||
            a.teamName.localeCompare(b.teamName)
        )
        .map((participant, index) => ({
          ...participant,
          rank: index + 1,
        }));

      setLiveParticipants(rows);

      const current = rows.find(
        (participant) => participant.id === currentFantasyTeamId
      );

      if (current) setFantasyName(current.teamName);
    } catch (error) {
      console.error("Participant leaderboard loading error:", error);
      setLiveParticipants([]);
      setParticipantDataError(
        error?.message || "Unable to load participant leaderboard."
      );
    } finally {
      setParticipantDataLoading(false);
    }
  };

  // Reload participant data whenever the Admin Panel is opened.
  // This prevents the dashboard from depending on a single initial page-load request.
  useEffect(() => {
    if (screen === "admin") {
      loadPublicLeaderboard();
    }

    if (screen === "leaderboard") {
      loadParticipantLeaderboard();
    }
  }, [screen, currentFantasyTeamId, mobile, pin, teamEditingAllowed, teamDeadline, adminPin]);

  // =========================================================
  // TOTAL FANTASY POINTS
  // =========================================================

    const total = savedTeamPlayers.reduce(
      (sum, player) => {
        const basePoints =
          Number(player.points) || 0;

        if (player.id === captain) {
          return sum + basePoints * 2;
        }

        if (player.id === vice) {
          return sum + basePoints * 1.5;
        }

        return sum + basePoints;
      },
      0
    );

  // Participant scoring helper: base player points adjusted for C / VC.
  const getParticipantPlayerPoints = (participant, player) => {
    const basePoints = Number(publishedPoints[player.id] ?? player.points) || 0;

    if (player.id === participant.captain) return basePoints * 2;
    if (player.id === participant.vice) return basePoints * 1.5;
    return basePoints;
  };

  const getParticipantTotal = (participant) =>
    (participant.players || []).reduce(
      (sum, player) => sum + getParticipantPlayerPoints(participant, player),
      0
    );

  // Participant leaderboard data is privacy-aware.
  // Before the leaderboard is unlocked, only the logged-in participant's
  // own Fantasy Team is shown. Other teams become visible only when the
  // deadline has passed AND team editing is OFF.
  const participantLeaderboardRows = useMemo(() => {
    const rows = liveParticipants.map((participant) => ({
      ...participant,
      isCurrent: participant.id === currentFantasyTeamId,
    }));

    if (isLeaderboardPublic) {
      return rows;
    }

    const current = rows.find(
      (participant) => participant.id === currentFantasyTeamId
    );

    return current ? [{ ...current, rank: 1 }] : [];
  }, [liveParticipants, currentFantasyTeamId, isLeaderboardPublic]);

  const currentParticipantRank = isLeaderboardPublic
    ? participantLeaderboardRows.find((participant) => participant.isCurrent)?.rank ?? null
    : null;

  // =========================================================
  // ADMIN HELPERS
  // =========================================================

  const normalizePlayerId = (value) =>
    String(value ?? "").trim().padStart(3, "0");

  const parseFantasyPoints = (value) => {
    if (value === "" || value === null || value === undefined) return null;
    const number = Number(String(value).replace(/,/g, "").trim());
    return Number.isFinite(number) ? number : null;
  };

 const generateRandomXI = () => {
  if (!players || players.length < 11) {
    alert("Players are still loading. Please try again.");
    return;
  }

  const MAX_PLAYERS = 11;
  const MAX_CREDITS = 100;
  const MAX_FROM_TEAM = 3;

  /*
   * Shuffle an array without changing the original.
   */
  const shuffle = (array) => {
    const copy = [...array];

    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));

      [copy[i], copy[j]] = [copy[j], copy[i]];
    }

    return copy;
  };

  /*
   * Random selection weight.
   *
   * Fantasy Points are the MAIN factor.
   *
   * Credits are used as a constraint, not as the
   * thing we maximize instead of Fantasy Points.
   *
   * If everyone has 0 points, Selection Points
   * become the fallback ranking.
   */
  const getPlayerWeight = (player) => {
    const points = Math.max(
      0,
      Number(player.points) || 0
    );

    const credits = Math.max(
      0,
      Number(player.cost) || 0
    );

    if (points > 0) {
      return Math.pow(points + 10, 2);
    }

    /*
     * Before Fantasy Points are published:
     * higher-credit players are considered stronger
     * candidates, while the 100-credit limit still
     * controls the final XI.
     */
    return Math.pow(credits + 1, 2);
  };

  /*
   * Weighted random selection.
   */
  const weightedRandomPlayer = (availablePlayers) => {
    if (!availablePlayers.length) {
      return null;
    }

    const weights = availablePlayers.map(
      getPlayerWeight
    );

    const totalWeight = weights.reduce(
      (sum, weight) => sum + weight,
      0
    );

    let random =
      Math.random() * totalWeight;

    for (
      let i = 0;
      i < availablePlayers.length;
      i++
    ) {
      random -= weights[i];

      if (random <= 0) {
        return availablePlayers[i];
      }
    }

    return availablePlayers[
      availablePlayers.length - 1
    ];
  };

  /*
   * Determine the score of a completed XI.
   *
   * Fantasy Points are overwhelmingly more important
   * than credits.
   *
   * Credits are used as the tie-breaker.
   */
  const getTeamScore = (
    selectedPlayers,
    totalCredits,
    totalFantasyPoints
  ) => {
    const hasFantasyPoints =
      selectedPlayers.some(
        (player) =>
          Number(player.points) > 0
      );

    if (hasFantasyPoints) {
      /*
       * Fantasy Points are primary.
       *
       * Credits are only a small tie-breaker.
       */
      return (
        totalFantasyPoints * 1000 +
        totalCredits
      );
    }

    /*
     * Before the first match:
     * maximize Selection Points used.
     */
    return totalCredits;
  };

  let bestTeam = null;
  let bestScore = -Infinity;

  /*
   * Generate many valid combinations and keep
   * the strongest one.
   *
   * 10,000 attempts gives the randomizer plenty
   * of opportunity to find a high-scoring XI.
   */
  for (
    let attempt = 0;
    attempt < 10000;
    attempt++
  ) {
    const selectedPlayers = [];
    const teamCounts = {};

    let totalCredits = 0;
    let totalFantasyPoints = 0;

    let availablePlayers = shuffle(players);

    while (
      selectedPlayers.length <
        MAX_PLAYERS &&
      availablePlayers.length > 0
    ) {
      /*
       * Keep only players that can legally be added.
       */
      const validPlayers =
        availablePlayers.filter(
          (player) => {
            const team =
              String(
                player.team || ""
              ).trim();

            const credits =
              Number(player.cost) || 0;

            /*
             * Maximum 3 players from
             * any real FC team.
             */
            if (
              (teamCounts[team] || 0) >=
              MAX_FROM_TEAM
            ) {
              return false;
            }

            /*
             * Never exceed 100 credits.
             */
            if (
              totalCredits +
                credits >
              MAX_CREDITS
            ) {
              return false;
            }

            return true;
          }
        );

      if (!validPlayers.length) {
        break;
      }

      const player =
        weightedRandomPlayer(
          validPlayers
        );

      if (!player) {
        break;
      }

      selectedPlayers.push(player);

      const team =
        String(
          player.team || ""
        ).trim();

      const credits =
        Number(player.cost) || 0;

      const points =
        Number(player.points) || 0;

      teamCounts[team] =
        (teamCounts[team] || 0) + 1;

      totalCredits += credits;
      totalFantasyPoints += points;

      availablePlayers =
        availablePlayers.filter(
          (p) => p.id !== player.id
        );
    }

    /*
     * Must contain exactly 11 players.
     */
    if (
      selectedPlayers.length !==
      MAX_PLAYERS
    ) {
      continue;
    }

    /*
     * Final safety checks.
     */
    if (totalCredits > MAX_CREDITS) {
      continue;
    }

    const validTeamCounts =
      Object.values(teamCounts).every(
        (count) =>
          count <= MAX_FROM_TEAM
      );

    if (!validTeamCounts) {
      continue;
    }

    /*
     * Calculate overall team score.
     */
    const score = getTeamScore(
      selectedPlayers,
      totalCredits,
      totalFantasyPoints
    );

    /*
     * Keep the best valid XI.
     */
    if (score > bestScore) {
      bestScore = score;

      bestTeam = {
        players: selectedPlayers,
        credits: totalCredits,
        fantasyPoints:
          totalFantasyPoints,
        teamCounts,
      };
    }
  }

  /*
   * No valid XI found.
   */
  if (!bestTeam) {
    alert(
      "Unable to generate a valid Random XI. Please try again."
    );

    return;
  }

  /*
   * =====================================================
   * CAPTAIN
   * =====================================================
   *
   * Highest Fantasy Point players get priority.
   * Still retains some randomness.
   */
  const captainCandidates =
    [...bestTeam.players]
      .sort(
        (a, b) =>
          (Number(b.points) || 0) -
          (Number(a.points) || 0)
      )
      .slice(0, 5);

  const captain =
    captainCandidates[
      Math.floor(
        Math.random() *
          captainCandidates.length
      )
    ];

  /*
   * =====================================================
   * VICE CAPTAIN
   * =====================================================
   */
  const viceCaptainCandidates =
    bestTeam.players
      .filter(
        (player) =>
          player.id !== captain.id
      )
      .sort(
        (a, b) =>
          (Number(b.points) || 0) -
          (Number(a.points) || 0)
      )
      .slice(0, 5);

  const viceCaptain =
    viceCaptainCandidates[
      Math.floor(
        Math.random() *
          viceCaptainCandidates.length
      )
    ];

  /*
   * =====================================================
   * UPDATE UI
   * =====================================================
   */
  setSelected(
    bestTeam.players.map(
      (player) => player.id
    )
  );

  setCaptain(captain.id);
  setVice(viceCaptain.id);

  console.log(
    "Random XI generated:",
    {
      players:
        bestTeam.players.map(
          (player) =>
            player.name
        ),

      credits:
        bestTeam.credits,

      fantasyPoints:
        bestTeam.fantasyPoints,

      teamCounts:
        bestTeam.teamCounts,

      captain:
        captain.name,

      viceCaptain:
        viceCaptain.name,
    }
  );

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};

  const getHeader = (row, aliases) => {
    const keys = Object.keys(row);
    const normalized = {};
    keys.forEach((key) => {
      normalized[key.toLowerCase().replace(/[^a-z0-9]/g, "")] = key;
    });
    for (const alias of aliases) {
      const key = normalized[alias.toLowerCase().replace(/[^a-z0-9]/g, "")];
      if (key) return key;
    }
    return null;
  };

  const importPointsExcel = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      if (!sheetName) throw new Error("No worksheet found in the Excel file.");

      const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: "" });
      if (!rows.length) throw new Error("The Excel file contains no rows.");

      const idHeader = getHeader(rows[0], ["Player Number", "Player ID", "FC Player ID"]);
      const pointsHeader = getHeader(rows[0], ["Fantasy Points", "Points", "Fantasy Point"]);
      const nameHeader = getHeader(rows[0], ["Player Name", "Name"]);

      if (!idHeader || !pointsHeader) {
        throw new Error('Required columns missing. Use "Player Number" and "Fantasy Points".');
      }

      const playerMap = new Map(players.map((player) => [player.id, player]));
      const seen = new Set();
      const preview = [];
      const errors = [];

      rows.forEach((row, index) => {
        const excelRow = index + 2;
        const id = normalizePlayerId(row[idHeader]);
        const importedName = String(nameHeader ? row[nameHeader] : "").trim();
        const points = parseFantasyPoints(row[pointsHeader]);
        const player = playerMap.get(id);

        let status = "matched";
        let message = "Ready";

        if (!id || id === "000") {
          status = "invalid";
          message = "Missing Player Number";
        } else if (seen.has(id)) {
          status = "duplicate";
          message = "Duplicate Player Number";
        } else if (!player) {
          status = "unmatched";
          message = "Player Number not found in FC master list";
        } else if (points === null) {
          status = "invalid";
          message = "Fantasy Points must be a number";
        }

        seen.add(id);
        preview.push({
          row: excelRow,
          id,
          importedName,
          player,
          points: points ?? "",
          status,
          message,
        });

        if (status !== "matched") errors.push(`Excel row ${excelRow}: ${message}`);
      });

      setAdminFileName(file.name);
      setAdminImportRows(preview);
      setAdminImportErrors(errors);
    } catch (error) {
      setAdminFileName(file.name);
      setAdminImportRows([]);
      setAdminImportErrors([error.message || "Unable to read the Excel file."]);
    } finally {
      event.target.value = "";
    }
  };

  const updateImportedPoints = (rowIndex, value) => {
    setAdminImportRows((rows) =>
      rows.map((row, index) =>
        index === rowIndex
          ? {
              ...row,
              points: value,
              status: row.player && parseFantasyPoints(value) !== null ? "matched" : "invalid",
              message: row.player && parseFantasyPoints(value) !== null ? "Ready" : "Fantasy Points must be a number",
            }
          : row
      )
    );
  };

  const remapImportedRow = (rowIndex, playerId) => {
    const player = players.find((item) => item.id === playerId);
    setAdminImportRows((rows) =>
      rows.map((row, index) =>
        index === rowIndex
          ? {
              ...row,
              id: player?.id || row.id,
              player: player || null,
              status: player && parseFantasyPoints(row.points) !== null ? "matched" : "invalid",
              message: player && parseFantasyPoints(row.points) !== null ? "Ready" : "Fantasy Points must be a number",
            }
          : row
      )
    );
  };

  const publishImportedPoints = async () => {
  if (!adminImportRows.length) {
    alert(
      "Upload the latest Fantasy Points Excel file first."
    );
    return;
  }

  // ==========================================
  // CHECK FOR VALIDATION ISSUES
  // ==========================================

  const critical =
    adminImportRows.filter((row) =>
      [
        "invalid",
        "duplicate",
        "unmatched",
      ].includes(row.status)
    );

  if (critical.length) {
    alert(
      "Resolve all unmatched, invalid and duplicate rows before publishing."
    );
    return;
  }

  // ==========================================
  // PREPARE DATA FOR SUPABASE
  // ==========================================

  const pointsPayload =
    adminImportRows
      .map((row) => {
        const points =
          parseFantasyPoints(row.points);

        if (
          !row.player?.databaseId ||
          points === null
        ) {
          return null;
        }

        return {
          player_id:
            row.player.databaseId,

          fantasy_points:
            points,
        };
      })
      .filter(Boolean);

  if (!pointsPayload.length) {
    alert(
      "No valid player points found to publish."
    );
    return;
  }

  // ==========================================
  // PUBLISH TO SUPABASE
  // ==========================================

  try {
    const { data, error } =
      await supabase.rpc(
        "publish_player_points",
        {
          p_admin_pin: adminPin,
          p_points: pointsPayload,
        }
      );

    if (error) {
      throw error;
    }

    console.log(
      "Player points published:",
      data
    );

    // ==========================================
    // UPDATE CURRENT UI
    // ==========================================

    const latestPoints = {};

    adminImportRows.forEach((row) => {
      const points =
        parseFantasyPoints(row.points);

      if (
        row.player &&
        points !== null
      ) {
        latestPoints[
          row.player.id
        ] = points;
      }
    });

    setPublishedPoints(
      latestPoints
    );

    setPlayers(
      (currentPlayers) =>
        currentPlayers.map(
          (player) => ({
            ...player,
            points:
              Number(
                latestPoints[player.id]
              ) || 0,
          })
        )
    );

    await loadPublicLeaderboard();

    alert(
      `${pointsPayload.length} player points published successfully.`
    );

  } catch (error) {

    console.error(
      "Publish points error:",
      error
    );

    alert(
      error.message ||
        "Unable to publish player points."
    );
  }
};

  const clearImportedPoints = () => {
    if (!window.confirm("Clear the current import preview?")) return;
    setAdminImportRows([]);
    setAdminImportErrors([]);
    setAdminFileName("");
  };

  const openParticipantEditor = (participant) => {
    setEditingParticipantId(participant.id);
    setAdminTeamName(participant.teamName);
    setAdminTeamPlayers([...participant.playerIds]);
    setAdminCaptain(participant.captain);
    setAdminVice(participant.vice);
  };

  const saveParticipantTeam = async () => {
    if (!editingParticipantId) return;
    if (!adminTeamName.trim()) {
      alert("Enter a Fantasy Team Name.");
      return;
    }
    if (adminTeamPlayers.length !== 11 || new Set(adminTeamPlayers).size !== 11) {
      alert("Participant team must contain exactly 11 different players.");
      return;
    }
    if (!adminCaptain || !adminVice || adminCaptain === adminVice) {
      alert("Select different Captain and Vice Captain.");
      return;
    }

    const selectedAdminPlayers = players.filter((player) => adminTeamPlayers.includes(player.id));
    const adminBudget = selectedAdminPlayers.reduce((sum, player) => sum + player.cost, 0);
    if (adminBudget > 100) {
      alert("The edited team exceeds the 100 Selection Points budget.");
      return;
    }

    const teamCounts = selectedAdminPlayers.reduce((acc, player) => {
      acc[player.team] = (acc[player.team] || 0) + 1;
      return acc;
    }, {});
    if (Object.values(teamCounts).some((count) => count > 3)) {
      alert("A participant can have a maximum of 3 players from one real team.");
      return;
    }

    setAdminParticipants((current) =>
      current.map((participant) =>
        participant.id === editingParticipantId
          ? { ...participant, teamName: adminTeamName.trim(), playerIds: [...adminTeamPlayers], captain: adminCaptain, vice: adminVice }
          : participant
      )
    );

    // Keep the currently logged-in prototype participant in sync with the edited backend record.
    const currentParticipant = adminParticipants.find((participant) => participant.id === editingParticipantId);
    if (currentParticipant?.mobile === mobile) {
      setFantasyName(adminTeamName.trim());
      setSelected([...adminTeamPlayers]);
      setCaptain(adminCaptain);
      setVice(adminVice);
    }

    await loadPublicLeaderboard();
    alert("Participant Fantasy Team updated successfully.");
    setEditingParticipantId(null);
  };

  // =========================================================
  // PLAYER PHOTO
  // =========================================================

  const PlayerAvatar = ({
    player,
    small = false,
  }) => {
    const initials = player.name
      .split(" ")
      .map((word) => word[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

    return (
      <div
        className={`avatar ${
          small ? "small" : ""
        }`}
      >
        {player.image ? (
          <img
            src={player.image}
            alt={player.name}
            className="player-photo"
            onError={(event) => {
              event.currentTarget.style.display =
                "none";

              const fallback =
                event.currentTarget.parentElement?.querySelector(
                  ".fallback-initials"
                );

              if (fallback) {
                fallback.style.display =
                  "flex";
              }
            }}
          />
        ) : null}

        <span
          className="fallback-initials"
          style={{
            display: player.image
              ? "none"
              : "flex",
          }}
        >
          {initials}
        </span>
      </div>
    );
  };

  // =========================================================
  // ADMIN PLAYER LEADERBOARD
  // =========================================================

  const adminLeaderboardRows = useMemo(() => {
    const latestPoints = publishedPoints || {};
    const query = adminLeaderboardSearch.toLowerCase().trim();

    return players
      .map((player) => ({
        ...player,
        leaderboardPoints: Number(latestPoints[player.id] ?? player.points) || 0,
      }))
      .filter((player) => {
        if (adminLeaderboardTeam !== "ALL" && player.team !== adminLeaderboardTeam) return false;
        if (!query) return true;
        return `${player.name} ${player.team} ${player.id}`.toLowerCase().includes(query);
      })
      .sort((a, b) => b.leaderboardPoints - a.leaderboardPoints || a.name.localeCompare(b.name));
  }, [players, publishedPoints, adminLeaderboardTeam, adminLeaderboardSearch]);

  // =========================================================
  // ADMIN PIN
  // =========================================================

  if (screen === "admin-login") {
    return (
      <div className="center">
        <div className="card auth admin-auth">
          <button className="back" onClick={() => setScreen("login")}>← Back</button>
          <img className="logo" src="/fc-logo.png" alt="FC Fantasy 57 logo" />
          <div className="eyebrow">FRIENDSHIP CUP • PRIVATE</div>
          <h2>Admin Panel</h2>
          <p>Authorized admins only.</p>
          <label>Admin PIN</label>
          <input
            className="text"
            type="password"
            inputMode="numeric"
            value={adminPin}
            onChange={(event) => setAdminPin(event.target.value.replace(/\D/g, "").slice(0, 8))}
            placeholder="Enter admin PIN"
          />
          <button onClick={() => adminPin === "2503" ? setScreen("admin") : alert("Incorrect admin PIN.")}>ENTER ADMIN PANEL</button>
          
        </div>
      </div>
    );
  }

  // =========================================================
  // ADMIN PANEL
  // =========================================================

  if (screen === "admin") {
    const matchedCount = adminImportRows.filter((row) => row.status === "matched").length;
    const unmatchedCount = adminImportRows.filter((row) => row.status === "unmatched").length;
    const issueCount = adminImportRows.filter((row) => row.status === "invalid" || row.status === "duplicate").length;
    const visibleImportRows = adminImportRows.filter((row) => {
      if (adminTeamFilter !== "ALL" && row.player?.team !== adminTeamFilter) return false;
      const q = adminSearch.toLowerCase().trim();
      if (!q) return true;
      return `${row.player?.name || ""} ${row.player?.team || ""} ${row.id} ${row.importedName}`.toLowerCase().includes(q);
    });

    return (
      <div className="page admin-page">
        <header className="admin-header">
          <div>
            <div className="eyebrow">FRIENDSHIP CUP • SEASON 7</div>
            <h2>Admin Panel</h2>
            <p>Latest Fantasy Points + player rankings + participant corrections.</p>
          </div>
          <button className="secondary" onClick={() => { setAdminPin(""); setScreen("login"); }}>LOG OUT</button>
        </header>

        <div className="admin-top-actions">
          <button className="secondary" onClick={clearImportedPoints}>CLEAR IMPORT</button>
          <button onClick={publishImportedPoints} disabled={!adminImportRows.length}>PUBLISH LATEST POINTS</button>
        </div>

        <section className="admin-card settings-card" id="fantasy-settings">
          <div className="admin-card-title">
            <div>
              <div className="eyebrow">1 • FANTASY SETTINGS</div>
              <h3>Team Submission Settings</h3>
              <p className="section-description">
                Control team editing and set the Fantasy XI submission deadline.
              </p>
            </div>
          </div>

          <div className="settings-row">
            <div>
              <b>Allow Team Editing</b>
              <span>
                Participants can update their submitted XI when this is ON.
              </span>
            </div>

            <label className="switch">
              <input
                type="checkbox"
                checked={teamEditingAllowed}
                onChange={(event) =>
                  setTeamEditingAllowed(event.target.checked)
                }
              />
              <span className="slider"></span>
            </label>
          </div>

          <div className="settings-field">
            <label>Team Submission Deadline</label>

            <input
              className="text"
              type="datetime-local"
              value={adminDeadlineInput}
              onChange={(event) =>
                setAdminDeadlineInput(event.target.value)
              }
            />

            <small>
              Leave blank if there is no deadline. The participant screen
              will show this deadline.
            </small>
          </div>

          <button
            onClick={async () => {
              try {
                const deadline = adminDeadlineInput
                  ? new Date(adminDeadlineInput).toISOString()
                  : null;

                const { data, error } =
                  await supabase.rpc(
                    "update_fantasy_settings",
                    {
                      p_admin_pin: adminPin,
                      p_team_editing_allowed:
                        teamEditingAllowed,
                      p_team_deadline: deadline,
                    }
                  );

                if (error) throw error;

                if (!data?.success) {
                  throw new Error(
                    "Unable to save Fantasy settings."
                  );
                }

                setTeamDeadline(
                  data.team_deadline || null
                );

                alert(
                  "Fantasy settings updated successfully."
                );
              } catch (error) {
                console.error(
                  "Fantasy settings update error:",
                  error
                );

                alert(
                  error.message ||
                    "Unable to update Fantasy settings."
                );
              }
            }}
            disabled={settingsLoading}
          >
            {settingsLoading
              ? "SAVING..."
              : "SAVE FANTASY SETTINGS"}
          </button>
        </section>

        <div className="admin-nav">
          <button className="active">LATEST POINTS</button>
          <button onClick={() => document.getElementById("player-leaderboard")?.scrollIntoView({ behavior: "smooth" })}>PLAYER LEADERBOARD</button>
          <button onClick={() => document.getElementById("participant-dashboard")?.scrollIntoView({ behavior: "smooth" })}>PARTICIPANT DASHBOARD</button>
          <button onClick={() => document.getElementById("participant-manager")?.scrollIntoView({ behavior: "smooth" })}>TEAM CORRECTIONS</button>
        </div>

        <section className="admin-card">
          <div className="admin-card-title">
            <div>
              <div className="eyebrow">2 • IMPORT</div>
              <h3>Upload Latest Fantasy Points</h3>
            </div>
          </div>

          <div className="upload-box">
            <input id="points-excel" type="file" accept=".xlsx,.xls,.csv" onChange={importPointsExcel} />
            <label htmlFor="points-excel">
              <strong>UPLOAD EXCEL</strong>
              <span>{adminFileName || "Player Number + Latest Fantasy Points"}</span>
            </label>
          </div>

          <div className="template-row">
            <button className="secondary" onClick={() => {
              const template = players.map((player) => ({ "Player Number": player.id, "Player Name": player.name, "Team": player.team, "Fantasy Points": "" }));
              const ws = XLSX.utils.json_to_sheet(template);
              const wb = XLSX.utils.book_new();
              XLSX.utils.book_append_sheet(wb, ws, "Latest Points");
              XLSX.writeFile(wb, "FC_Season7_Latest_Points_Template.xlsx");
            }}>DOWNLOAD POINTS TEMPLATE</button>
            <span>Primary key: FC Player Number • Upload the latest total Fantasy Points for each player</span>
          </div>
        </section>

        {adminImportRows.length > 0 && (
          <section className="admin-card collapsible-card">
            <button className="collapse-header" onClick={() => setShowImportPreview((value) => !value)}>
              <div><div className="eyebrow">2 • VALIDATE</div><h3>Import Preview</h3></div>
              <span>{showImportPreview ? "−" : "+"}</span>
            </button>
            {showImportPreview && <div className="collapse-content">
            <div className="admin-card-title">
              <div>
                <div className="eyebrow">VALIDATION</div>
                <h3>Review Imported Points</h3>
              </div>
              <div className="admin-filter-row">
                <select className="admin-team-filter" value={adminTeamFilter} onChange={(event) => setAdminTeamFilter(event.target.value)}>
                  <option value="ALL">ALL TEAMS</option>
                  {Object.keys(teamLogos).map((team) => <option key={team} value={team}>{team}</option>)}
                </select>
                {adminTeamFilter !== "ALL" && <button className="secondary filter-clear" onClick={() => setAdminTeamFilter("ALL")}>CLEAR FILTER</button>}
                <input className="admin-search" value={adminSearch} onChange={(event) => setAdminSearch(event.target.value)} placeholder="Search player..." />
              </div>
            </div>

            <div className="admin-summary">
              <div><b>{adminImportRows.length}</b><span>Rows</span></div>
              <div className="ok"><b>{matchedCount}</b><span>Matched</span></div>
              <div className="warn"><b>{unmatchedCount}</b><span>Unmatched</span></div>
              <div className="danger"><b>{issueCount}</b><span>Issues</span></div>
            </div>

            {adminImportErrors.length > 0 && (
              <div className="admin-warning">
                {adminImportErrors.slice(0, 8).map((error) => <div key={error}>{error}</div>)}
                {adminImportErrors.length > 8 && <div>+ {adminImportErrors.length - 8} more issue(s)</div>}
              </div>
            )}

            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead><tr><th>STATUS</th><th>PLAYER</th><th>TEAM</th><th>POINTS</th><th>ACTION</th></tr></thead>
                <tbody>
                  {visibleImportRows.map((row, visibleIndex) => {
                    const realIndex = adminImportRows.indexOf(row);
                    return (
                      <tr key={`${row.row}-${row.id}-${visibleIndex}`}>
                        <td><span className={`status ${row.status}`}>{row.status.toUpperCase()}</span></td>
                        <td>
                          <div className="admin-player-cell">
                            {row.player ? <PlayerAvatar player={row.player} small /> : <div className="avatar small">?</div>}
                            <div><b>{row.player?.name || row.importedName || "Unknown"}</b><small>FC ID: {row.id || "—"} • Excel row {row.row}</small></div>
                          </div>
                        </td>
                        <td>{row.player?.team || "—"}</td>
                        <td><input className="points-input" type="number" value={row.points} onChange={(event) => updateImportedPoints(realIndex, event.target.value)} /></td>
                        <td>
                          {!row.player && (
                            <select value="" onChange={(event) => remapImportedRow(realIndex, event.target.value)}>
                              <option value="">MAP PLAYER</option>
                              {players.map((player) => <option key={player.id} value={player.id}>{player.id} • {player.name}</option>)}
                            </select>
                          )}
                          {row.player && <span className="ready-text">✓ Ready</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

          </div>}
          </section>
        )}

        <section className="admin-card collapsible-card" id="player-leaderboard">
          <button className="collapse-header" onClick={() => setShowPlayerLeaderboard((value) => !value)}>
            <div><div className="eyebrow">3 • PLAYER STATS</div><h3>Player Leaderboard</h3></div>
            <span>{showPlayerLeaderboard ? "−" : "+"}</span>
          </button>
          {showPlayerLeaderboard && <div className="collapse-content">
          <p className="section-description">View all FC players ranked by their latest published Fantasy Points.</p>
          <div className="leaderboard-controls">
            <select value={adminLeaderboardTeam} onChange={(event) => setAdminLeaderboardTeam(event.target.value)}>
              <option value="ALL">ALL TEAMS</option>
              {Object.keys(teamLogos).map((team) => <option key={team} value={team}>{team}</option>)}
            </select>
            {adminLeaderboardTeam !== "ALL" && (
              <button className="secondary leaderboard-clear" onClick={() => setAdminLeaderboardTeam("ALL")}>CLEAR FILTER</button>
            )}
            <input className="admin-search" value={adminLeaderboardSearch} onChange={(event) => setAdminLeaderboardSearch(event.target.value)} placeholder="Search player..." />
          </div>

          <div className="leaderboard-meta">
            <span><b>{adminLeaderboardRows.length}</b> players shown</span>
            <span>{players.some((player) => Number(player.points) > 0) ? "Latest points available" : "No points published yet"}</span>
          </div>

          <div className="admin-table-wrap">
            <table className="admin-table player-leaderboard-table">
              <thead>
                <tr><th>RANK</th><th>PLAYER</th><th>TEAM</th><th>CREDITS</th><th>FANTASY POINTS</th></tr>
              </thead>
              <tbody>
                {adminLeaderboardRows.map((player, index) => (
                  <tr key={player.id}>
                    <td><span className={`leaderboard-rank ${index < 3 ? "top-rank" : ""}`}>{index + 1}</span></td>
                    <td>
                      <div className="admin-player-cell">
                        <PlayerAvatar player={player} small />
                        <div><b>{player.name}</b><small>FC ID: {player.id}</small></div>
                      </div>
                    </td>
                    <td>{player.team}</td>
                    <td>{player.cost}</td>
                    <td><strong className="leaderboard-points">{player.leaderboardPoints}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </div>}
        </section>

        <section className="admin-card collapsible-card" id="participant-dashboard">
          <button className="collapse-header" onClick={() => setShowParticipantDashboard((value) => !value)}>
            <div><div className="eyebrow">4 • PARTICIPANTS</div><h3>Participant Dashboard</h3></div>
            <span>{showParticipantDashboard ? "−" : "+"}</span>
          </button>
          {showParticipantDashboard && <div className="collapse-content">
            <p className="section-description">View each participant's Fantasy Team, total points and selected players.</p>
            {participantDataLoading ? (
              <div className="empty">Loading participants from Supabase...</div>
            ) : participantDataError ? (
              <div className="empty">
                <b>Unable to load participant data.</b>
                <div style={{ marginTop: "8px" }}>{participantDataError}</div>
                <button
                  className="secondary"
                  style={{ marginTop: "12px" }}
                  onClick={loadPublicLeaderboard}
                >
                  RETRY
                </button>
              </div>
            ) : !liveParticipants.length ? (
              <div className="empty">No Fantasy Teams have been submitted yet.</div>
            ) : (
              <div className="participant-dashboard-grid">
                {liveParticipants.map((participant) => {
                  const teamPlayers = participant.players || [];
                  const participantTotal = Number(participant.totalPoints) || 0;

                  return (
                    <div className="participant-dashboard-card" key={participant.id}>
                      <div className="participant-dashboard-head">
                        <div>
                          <b>{participant.teamName || "Unnamed Fantasy Team"}</b>
                          <span>{participant.name || "Participant"} • {teamPlayers.length}/11 players</span>
                        </div>
                        <strong>{participantTotal.toFixed(1)} PTS</strong>
                      </div>

                      <div className="participant-dashboard-player-list">
                        {teamPlayers.map((player) => (
                          <div className="participant-dashboard-player-row" key={player.id}>
                            <div>
                              <PlayerAvatar player={player} small />
                              <span>
                                {player.name}
                                {player.id === participant.captain && (
                                  <em className="participant-role-chip captain">C</em>
                                )}
                                {player.id === participant.vice && (
                                  <em className="participant-role-chip vice">VC</em>
                                )}
                              </span>
                            </div>
                            <strong>
                              {getParticipantPlayerPoints(participant, player).toFixed(1)}
                            </strong>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>}
        </section>

        <section className="admin-card collapsible-card" id="participant-manager">
          <button className="collapse-header" onClick={() => setShowParticipantManager((value) => !value)}>
            <div><div className="eyebrow">5 • CORRECTIONS</div><h3>Participant Team Manager</h3></div>
            <span>{showParticipantManager ? "−" : "+"}</span>
          </button>
          {showParticipantManager && <div className="collapse-content">
          <p className="section-description">Correct a participant's team, players, Captain or Vice Captain when required.</p>

          {!editingParticipantId ? (
            <div className="participant-list">
              {participantDataLoading && liveParticipants.length === 0 ? (
                <div className="empty">Loading participants from Supabase...</div>
              ) : (liveParticipants.length ? liveParticipants : adminParticipants).map((participant) => {
                const teamPlayers = participant.players?.length
                  ? participant.players
                  : players.filter((player) => participant.playerIds.includes(player.id));
                return (
                  <div className="participant-row" key={participant.id}>
                    <div>
                      <b>{participant.teamName}</b>
                      <span>{participant.name} • {teamPlayers.length}/11 players</span>
                    </div>
                    <button className="secondary" onClick={() => openParticipantEditor(participant)}>EDIT TEAM</button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="team-editor">
              <button className="back" onClick={() => setEditingParticipantId(null)}>← Back to participants</button>
              <label>Fantasy Team Name</label>
              <input className="text" value={adminTeamName} onChange={(event) => setAdminTeamName(event.target.value)} />

              <div className="editor-grid">
                {Array.from({ length: 11 }, (_, index) => (
                  <div className="editor-player" key={index}>
                    <span>{index + 1}</span>
                    <select value={adminTeamPlayers[index] || ""} onChange={(event) => {
                      const next = [...adminTeamPlayers];
                      next[index] = event.target.value;
                      setAdminTeamPlayers(next);
                    }}>
                      <option value="">SELECT PLAYER</option>
                      {players.map((player) => <option key={player.id} value={player.id}>{player.id} • {player.name} • {player.cost} CR</option>)}
                    </select>
                  </div>
                ))}
              </div>

              <div className="role-editor">
                <div><label>Captain</label><select value={adminCaptain || ""} onChange={(event) => setAdminCaptain(event.target.value)}><option value="">SELECT C</option>{adminTeamPlayers.map((id) => { const p = players.find((player) => player.id === id); return p ? <option key={id} value={id}>{p.name}</option> : null; })}</select></div>
                <div><label>Vice Captain</label><select value={adminVice || ""} onChange={(event) => setAdminVice(event.target.value)}><option value="">SELECT VC</option>{adminTeamPlayers.map((id) => { const p = players.find((player) => player.id === id); return p ? <option key={id} value={id}>{p.name}</option> : null; })}</select></div>
              </div>

              <div className="editor-summary">
                <span>Credits: <b>{players.filter((p) => adminTeamPlayers.includes(p.id)).reduce((sum, p) => sum + p.cost, 0)}</b>/100</span>
                <span>Players: <b>{new Set(adminTeamPlayers.filter(Boolean)).size}</b>/11</span>
              </div>

              <button onClick={saveParticipantTeam}>SAVE PARTICIPANT TEAM</button>
            </div>
          )}
          </div>}
        </section>

        
      </div>
    );
  }

  // =========================================================
  // LOADING
  // =========================================================

  if (loadingPlayers) {
    return (
      <div className="center">
        <div className="card auth">
          <img
            className="logo"
            src="/fc-logo.png"
            alt="FC Fantasy 57 logo"
          />

          <div className="eyebrow">
            FRIENDSHIP CUP
          </div>

          <h2>
            Loading Players...
          </h2>

          <p>
            Loading the FC Season 7
            Player Master List
          </p>
        </div>
      </div>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (playerLoadError) {
    return (
      <div className="center">
        <div className="card auth">

          <img
            className="logo"
            src="/fc-logo.png"
            alt="FC Fantasy 57 logo"
          />

          <div className="eyebrow">
            FRIENDSHIP CUP
          </div>

          <h2>
            Unable to Load Players
          </h2>

          <p>
            {playerLoadError}
          </p>

          <button
            onClick={() =>
              window.location.reload()
            }
          >
            RETRY
          </button>

        </div>
      </div>
    );
  }

  // =========================================================
  // LOGIN SCREEN
  // =========================================================

  if (screen === "login") {
  return (
    <div className="center">
      <div className="card auth">

        <img
          className="logo"
          src="/fc-logo.png"
          alt="FC Fantasy 57 logo"
        />

        <div className="eyebrow">
          FRIENDSHIP CUP
        </div>

        <h1>FANTASY</h1>

        <p>
          Build your XI. Back your
          players. Rule the leaderboard.
        </p>

        <div className="auth-tabs">
  <button
    className="auth-tab active"
    type="button"
  >
    SIGN IN
  </button>

  <button
    className="auth-tab"
    type="button"
    disabled={settingsLoading || isRegistrationClosed}
    onClick={() => {
      if (settingsLoading) return;
      if (isRegistrationClosed) {
        setAuthError(
          isDeadlinePassed
            ? "Fantasy registration is closed because the submission deadline has passed."
            : "Fantasy registration is currently closed by the admin."
        );
        return;
      }
      resetAuthFields();
      setScreen("register");
    }}
  >
    REGISTER
  </button>
</div>

        {isRegistrationClosed && !settingsLoading && (
          <div className="auth-closed-message">
            {isDeadlinePassed
              ? "Registration is closed because the Fantasy Team submission deadline has passed."
              : "Registration is currently closed by the admin."}
          </div>
        )}

        <label>
          Mobile Number
        </label>

        <div className="phone">
          <span>+91</span>

          <input
            value={mobile}
            onChange={(event) =>
              setMobile(
                event.target.value
                  .replace(/\D/g, "")
                  .slice(0, 10)
              )
            }
            placeholder="Enter mobile number"
            inputMode="numeric"
          />
        </div>

        <label>
          PIN
        </label>

        <input
          className="text"
          type="password"
          value={pin}
          onChange={(event) =>
            setPin(
              event.target.value
                .replace(/\D/g, "")
                .slice(0, 6)
            )
          }
          placeholder="Enter 4–6 digit PIN"
          inputMode="numeric"
          maxLength={6}
        />

        {authError && (
          <div className="auth-error">
            {authError}
          </div>
        )}

        <button
          onClick={signIn}
          disabled={authLoading}
        >
          {authLoading
            ? "SIGNING IN..."
            : "SIGN IN"}
        </button>

        <button
  type="button"
  className="admin-login-link"
  onClick={() => {
    resetAuthFields();
    setScreen("admin-login");
  }}
>
  ADMIN LOGIN
</button>

        <small>
          SEASON 7
        </small>

      </div>
    </div>
  );
}

// =========================================================
// REGISTER SCREEN
// =========================================================

if (screen === "register") {
  return (
    <div className="center">
      <div className="card auth">

        {isRegistrationClosed && (
          <div className="auth-error">
            {settingsLoading
              ? "Loading Fantasy registration status..."
              : isDeadlinePassed
                ? "Fantasy registration is closed because the submission deadline has passed."
                : "Fantasy registration is currently closed by the admin."}
          </div>
        )}

        <button
          className="back"
          type="button"
          onClick={() => {
            resetAuthFields();
            const logoutParticipant = () => {
              // Clear authentication/session data
              setMobile("");
              setPin("");
              setConfirmPin("");
              setName("");
              setFantasyName("");

              setCurrentUserId(null);
              setCurrentFantasyTeamId(null);

              // Clear current team state
              setSelected([]);
              setCaptain(null);
              setVice(null);
              setSavedTeamPlayers([]);

              // Clear temporary errors/loading
              setAuthError("");
              setAuthLoading(false);
              setSavedTeamLoading(false);

              // Return to participant login
              setScreen("login");
            };
            setScreen("login");
          }}
        >
          ← Back to Sign In
        </button>

        <img
          className="logo"
          src="/fc-logo.png"
          alt="FC Fantasy 57 logo"
        />

        <div className="eyebrow">
          WELCOME TO FC FANTASY
        </div>

        <h2>
          CREATE YOUR ACCOUNT
        </h2>

        <p>
          Register once and build your
          Fantasy XI.
        </p>

        <label>
          Your Name
        </label>

        <input
          className="text"
          value={name}
          onChange={(event) =>
            setName(event.target.value)
          }
          placeholder="Enter your name"
        />

        <label>
          Fantasy Team Name
        </label>

        <input
          className="text"
          value={fantasyName}
          onChange={(event) =>
            setFantasyName(
              event.target.value
            )
          }
          placeholder="e.g. Mohsin XI"
        />

        <label>
          Mobile Number
        </label>

        <div className="phone">
          <span>+91</span>

          <input
            value={mobile}
            onChange={(event) =>
              setMobile(
                event.target.value
                  .replace(/\D/g, "")
                  .slice(0, 10)
              )
            }
            placeholder="Enter mobile number"
            inputMode="numeric"
          />
        </div>

        <label>
          Create PIN
        </label>

        <input
          className="text"
          type="password"
          value={pin}
          onChange={(event) =>
            setPin(
              event.target.value
                .replace(/\D/g, "")
                .slice(0, 6)
            )
          }
          placeholder="Create 4–6 digit PIN"
          inputMode="numeric"
          maxLength={6}
        />

        <label>
          Confirm PIN
        </label>

        <input
          className="text"
          type="password"
          value={confirmPin}
          onChange={(event) =>
            setConfirmPin(
              event.target.value
                .replace(/\D/g, "")
                .slice(0, 6)
            )
          }
          placeholder="Re-enter your PIN"
          inputMode="numeric"
          maxLength={6}
        />

        {authError && (
          <div className="auth-error">
            {authError}
          </div>
        )}

        <button
          onClick={register}
          disabled={authLoading || settingsLoading || isRegistrationClosed}
        >
          {authLoading
            ? "CREATING ACCOUNT..."
            : "CREATE ACCOUNT"}
        </button>

        <small>
          SEASON 7
        </small>

      </div>
    </div>
  );
}

  // =========================================================
  // PROFILE SCREEN
  // =========================================================

  if (screen === "profile") {
    return (
      <div className="center">

        <div className="card auth">

          <button
            className="back"
            onClick={() =>
              setScreen("login")
            }
          >
            ← Back
          </button>

          <div className="eyebrow">
            WELCOME TO FC FANTASY
          </div>

          <h2>
            Create Your Fantasy Identity
          </h2>

          <p>
            This name will appear on
            the leaderboard.
          </p>

          <label>
            Your Name
          </label>

          <input
            className="text"
            value={name}
            onChange={(event) =>
              setName(event.target.value)
            }
            placeholder="Enter your name"
          />

          <label>
            Fantasy Team Name
          </label>

          <input
            className="text"
            value={fantasyName}
            onChange={(event) =>
              setFantasyName(
                event.target.value
              )
            }
            placeholder="e.g. Mohsin XI"
          />

          <button
            onClick={continueProfile}
          >
            CREATE MY TEAM
          </button>

        </div>

      </div>
    );
  }

  // =========================================================
  // SELECT PLAYERS
  // =========================================================

  if (screen === "select") {
    return (
      <div className="page">

        <div className="selection-top">

          <header>

            <div>
              <div className="eyebrow">
                FRIENDSHIP CUP
              </div>

              <h2>
                Build Your XI
              </h2>
            </div>

            <button
  type="button"
  className="random-xi-btn"
  onClick={generateRandomXI}
>
  🎲 RANDOM 11
</button>

            <div className="budget">

              <b>{budget}</b>/100

              <small>
                Selection Points
              </small>

            </div>

          </header>

          <div className="progress">

            <div>
              <b>
                {selected.length}/11
              </b>

              <span>
                {" "}Players
              </span>
            </div>

            <span>
              {100 - budget} remaining
            </span>

          </div>

          {teamDeadline && (
            <div
              className={`deadline-banner ${
                isDeadlinePassed
                  ? "deadline-closed"
                  : ""
              }`}
            >
              <span>
                {isDeadlinePassed
                  ? "TEAM SUBMISSION CLOSED"
                  : "TEAM SUBMISSION DEADLINE"}
              </span>

              <b>{formattedDeadline}</b>
            </div>
          )}

          <div className="team-picks" aria-label="Players selected from each team">
            {Object.entries(teamLogos).map(([team, logo]) => (
              <div className="team-pick-card" key={team}>
                <img
                  src={logo}
                  alt={`${team} logo`}
                  className="team-pick-logo"
                />

                <div className="team-pick-name">
                  {team}
                </div>

                <div className="team-pick-count">
                  {counts[team] || 0}<span>/3</span>
                </div>
              </div>
            ))}
          </div>

          <div className="tools">

            <input
              className="text"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search player or team..."
            />

            <select
              value={filter}
              onChange={(event) =>
                setFilter(
                  event.target.value
                )
              }
            >

              <option value="ALL">
                ALL TEAMS
              </option>

              {teams.map((team) => (
                <option
                  key={team}
                  value={team}
                >
                  {team}
                </option>
              ))}

            </select>

          </div>

        </div>

        <div className="player-list-section">

  <div className="player-list-header">
    <div>PLAYER DETAILS</div>
    <div>CREDIT</div>
  </div>

  <div className="players">
    {[...filtered]
  .sort((a, b) => {
    const aSelected = selected.includes(a.id);
    const bSelected = selected.includes(b.id);

    if (aSelected && !bSelected) return -1;
    if (!aSelected && bSelected) return 1;

    return 0;
  })
  .map(player => (
      <div
        className={`player ${selected.includes(player.id) ? "chosen" : ""}`}
        key={player.id}
      >
        <PlayerAvatar player={player} />

        <div className="info">
          <b>{player.name}</b>
          <span>{player.team}</span>
          <small>{player.role}</small>
        </div>

        <div className="cost">
          {player.cost}
        </div>

        <button
          className="add"
          onClick={() => toggle(player)}
        >
          {selected.includes(player.id) ? "✓" : "+"}
        </button>
      </div>
    ))}
  </div>

</div>

        {/* BOTTOM BAR */}

        <div className="bottom">

          <b>
            {selected.length}/11
          </b>

          <button
            disabled={
              isDeadlinePassed ||
              (savedTeamPlayers.length === 11 &&
                !teamEditingAllowed)
            }
            onClick={() =>
              isDeadlinePassed
                ? alert(
                    "The Fantasy Team submission deadline has passed."
                  )
                : savedTeamPlayers.length === 11 &&
                  !teamEditingAllowed
                  ? alert(
                      "Team editing is currently disabled by the admin."
                    )
                  : selected.length === 11
                    ? setScreen("preview")
                    : alert(
                        "Select exactly 11 players."
                      )
            }
          >
            {isDeadlinePassed
              ? "SUBMISSION CLOSED"
              : savedTeamPlayers.length === 11 &&
                  !teamEditingAllowed
                ? "EDITING CLOSED"
                : "PREVIEW TEAM →"}
          </button>

        </div>

      </div>
    );
  }

  // =========================================================
  // PREVIEW
  // =========================================================

  if (screen === "preview") {
    return (
      <div className="page">

        <header>

          <div>

            <button
              className="back"
              onClick={() =>
                setScreen("select")
              }
            >
              ← Back
            </button>

            <div className="eyebrow">
              YOUR FANTASY XI
            </div>

            <h2>
              {fantasyName}
            </h2>

          </div>

          <div className="budget">

            <b>{budget}</b>/100

            <small>
              Used
            </small>

          </div>

        </header>

       <div className="notice">
  Choose <b>Captain</b> for
  2× and <b>Vice Captain </b>
   for 1.5× points.
</div>

<div className="player-list-header">
  <div>PLAYER DETAILS</div>
  <div>CREDIT</div>
</div>

<div className="players">

          {selectedPlayers.map(
            (player) => (

              <div
                className="player"
                key={player.id}
              >

                <PlayerAvatar
                  player={player}
                />

                <div className="info">
  <b>
    {player.name}
  </b>

  <span>
    {player.team}
  </span>

  <small>
    {player.role}
  </small>
</div>

<div className="cost">
  {player.cost}
</div>

<div className="roles">

                  <button
                    className={
                      captain === player.id
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      selectCaptain(
                        player.id
                      )
                    }
                  >
                    C
                  </button>

                  <button
                    className={
                      vice === player.id
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      selectVice(
                        player.id
                      )
                    }
                  >
                    VC
                  </button>

                </div>

              </div>

            )
          )}

        </div>

        <div className="summary">

          <div>
            Captain{" "}
            <b>
              {captain
                ? players.find(
                    (player) =>
                      player.id ===
                      captain
                  )?.name
                : "Not selected"}
            </b>
          </div>

          <div>
            Vice Captain{" "}
            <b>
              {vice
                ? players.find(
                    (player) =>
                      player.id ===
                      vice
                  )?.name
                : "Not selected"}
            </b>
          </div>

        </div>

        <button
          onClick={submit}
        >
          CONFIRM & SUBMIT TEAM
        </button>

      </div>
    );
  }

  // =========================================================
  // LEADERBOARD
  // =========================================================

  if (screen === "leaderboard") {

    return (
      <div className="page">

        <button
          className="back"
          onClick={() => setScreen("dashboard")}
        >
          ← Back
        </button>

        <div className="eyebrow">
          FRIENDSHIP CUP
        </div>

        <h2>
          Leaderboard
        </h2>

        <p className="section-description">
          {isLeaderboardPublic
            ? "Tap a fantasy team to see every player's points. Only one team can be expanded at a time."
            : "Your Fantasy Team is shown here. Other teams will be revealed after the deadline once team editing is turned OFF."}
        </p>

        <div className="user-participant-list leaderboard-participant-list">
          {participantLeaderboardRows.map((participant) => {
            const isOpen = openUserParticipantId === participant.id;
            const teamPlayers = participant.players?.length
                  ? participant.players
                  : players.filter((player) => participant.playerIds.includes(player.id));

            return (
              <div className={`user-participant-card ${isOpen ? "open" : ""}`} key={participant.id}>
                <button
                  className="user-participant-header"
                  onClick={() => setOpenUserParticipantId(isOpen ? null : participant.id)}
                >
                  <div className="leaderboard-participant-title">
                    <span className={`leaderboard-rank ${isLeaderboardPublic && participant.rank <= 3 ? "top-rank" : ""}`}>
                      {isLeaderboardPublic ? `#${participant.rank}` : "—"}
                    </span>
                    <div>
                      <b>{participant.teamName}</b>
                      <span>{participant.name}</span>
                    </div>
                  </div>
                  <div className="user-participant-header-right">
                    <strong>{participant.totalPoints.toFixed(1)} PTS</strong>
                    <span className="accordion-icon">{isOpen ? "−" : "+"}</span>
                  </div>
                </button>

                {isOpen && (
                  <div className="user-participant-players">
                    {teamPlayers.length ? teamPlayers.map((player) => (
                      <div className="user-participant-player-row" key={player.id}>
                        <div className="user-participant-player-info">
                          <PlayerAvatar player={player} small />
                          <div>
                            <b>{player.name}</b>
                            <span>{player.team}</span>
                          </div>
                          {player.id === participant.captain && <em className="participant-role-chip captain">C</em>}
                          {player.id === participant.vice && <em className="participant-role-chip vice">VC</em>}
                        </div>
                        <strong>{getParticipantPlayerPoints(participant, player).toFixed(1)}</strong>
                      </div>
                    )) : (
                      <div className="empty">No players submitted yet.</div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    );
  }

  // =========================================================
  // DASHBOARD
  // =========================================================

  return (
    <div className="page">

      <div className="hero">

  <div className="dashboard-topbar">
    <div>
      <div className="eyebrow">
        SEASON 7 • FANTASY
      </div>

      <h1>
        {fantasyName}
      </h1>

      <p>
        {name}
      </p>
    </div>

    <button
      type="button"
      className="logout-button"
      onClick={() => {
  setMobile("");
  setPin("");
  setConfirmPin("");
  setName("");
  setFantasyName("");

  setCurrentUserId(null);
  setCurrentFantasyTeamId(null);

  setSelected([]);
  setCaptain(null);
  setVice(null);

  setAuthError("");
  setAuthLoading(false);

  setScreen("login");
}}
    >
      LOG OUT
    </button>
  </div>

</div>

      <div className="stats">

        <div>
          <small>
            MY POINTS
          </small>

          <b>
            {total}
          </b>
        </div>

        <div>
          <small>
            OVERALL RANK
          </small>

          <b>
            {currentParticipantRank ? `#${currentParticipantRank}` : "#--"}
          </b>
        </div>

      </div>

      <div className="team-edit-panel">
        <div>
          <b>FANTASY TEAM STATUS</b>

          <span>
            {isDeadlinePassed
              ? "Team submission and editing are closed."
              : canEditTeam
                ? "Your Fantasy XI can be updated."
                : "Team editing is currently disabled by the admin."}
          </span>

          {formattedDeadline && (
            <small>
              Deadline: {formattedDeadline}
            </small>
          )}
        </div>

        {canEditTeam && savedTeamPlayers.length === 11 && (
          <button
            className="secondary"
            type="button"
            onClick={() => {
              setSelected(
                savedTeamPlayers.map(
                  (player) => player.id
                )
              );

              setCaptain(
                savedTeamPlayers.find(
                  (player) => player.isCaptain
                )?.id || null
              );

              setVice(
                savedTeamPlayers.find(
                  (player) => player.isViceCaptain
                )?.id || null
              );

              setScreen("select");
            }}
          >
            EDIT TEAM
          </button>
        )}
      </div>

      {/* =====================================================
          MY FANTASY XI
          ===================================================== */}

      <div className="section">

        <h3>
          My Fantasy XI
        </h3>

        {/* TABLE HEADERS */}

        <div className="fantasy-header">

          <div>
            PLAYER NAME
          </div>

          <div>
            CREDITS
          </div>

          <div>
            FANTASY POINTS
          </div>

        </div>

        {/* PLAYER LIST */}

        <div className="fantasy-list">

          {savedTeamPlayers.map(
            (player) => {

              const basePoints =
                  Number(player.points) || 0;

              let fantasyPoints =
                basePoints;

              if (
                player.id === captain
              ) {
                fantasyPoints =
                  basePoints * 2;
              }

              if (
                player.id === vice
              ) {
                fantasyPoints =
                  basePoints * 1.5;
              }

              return (
                <div
                  className="fantasy-player"
                  key={player.id}
                >

                  {/* PLAYER */}

                  <div className="fantasy-player-info">

                    <PlayerAvatar
                      player={player}
                      small
                    />

                    <div className="fantasy-player-name">

                      {/* NAME + C / VC */}

                      <div className="name-row">

                        <b>
                          {player.name}
                        </b>

                        {player.id ===
                          captain && (
                          <span className="captain-chip">
                            C
                          </span>
                        )}

                        {player.id ===
                          vice && (
                          <span className="vice-chip">
                            VC
                          </span>
                        )}

                      </div>

                      <small>
                        {player.team}
                      </small>

                    </div>

                  </div>

                  {/* CREDITS */}

                  <div className="fantasy-credits">
                    {player.cost}
                  </div>

                  {/* FANTASY POINTS */}

                  <div className="fantasy-points">
                    {fantasyPoints}
                  </div>

                </div>
              );
            }
          )}

        </div>

      </div>

      <button
        onClick={() => {
          setOpenUserParticipantId(null);
          setScreen("leaderboard");
        }}
      >
        VIEW ALL PARTICIPANTS →
      </button>

    </div>
  );
}

export default App;