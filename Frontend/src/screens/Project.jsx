import React, { useState, useEffect, useContext, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "../config/axios";
import { initializeSocket, receiveMessage, sendMessage } from "../config/socket";
import { UserContext } from "../context/user.context";
import Markdown from "markdown-to-jsx";
import { getWebContainer } from "../config/webContainer";
import Editor from '@monaco-editor/react';

const Project = () => {
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [project, setProject] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState(new Set());
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const { user } = useContext(UserContext);
  const messageBoxRef = useRef(null);

  const [fileTree, setFileTree] = useState({})

  const [openFiles, setOpenFiles] = useState([])

  const [currentFile, setCurrentFile] = useState(null)

  const [webContainer, setWebContainer] = useState(null)

  const [iFrameUrl, setIFrameUrl] = useState(null)

  const [runProcess, setRunProcess] = useState(null)

  const { projectId } = useParams();

  const getLanguage = (fileName) => {
    if (fileName?.endsWith('.js')) return 'javascript';
    if (fileName?.endsWith('.ts')) return 'typescript';
    if (fileName?.endsWith('.html')) return 'html';
    if (fileName?.endsWith('.css')) return 'css';
    if (fileName?.endsWith('.json')) return 'json';
    return 'plaintext';
  };

  const fetchProjectData = () => {
    const token = localStorage.getItem("token");
    axios
      .get(`${import.meta.env.VITE_API_URL}/projects/get-project/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setProject(res.data.project);
        setFileTree(res.data.project.fileTree || {})
        if (window.socketInitialized) return; 
        initializeSocket(res.data.project._id);
        window.socketInitialized = true;


        
        if(!webContainer){
          getWebContainer().then(container => {
            setWebContainer(container)
          })
        }



        receiveMessage("project-message", (data) => {
          if (data.message) {
            setFileTree(data.message.fileTree || {});
            if (data.message.fileTree) {
              webContainer?.mount(data.message.fileTree);
            }
          }
          appendIncomingMessage(data);
        });
      })
      .catch((err) => console.error("Error fetching project:", err));
  };

  const fetchUsers = () => {
    const token = localStorage.getItem("token");
    axios
      .get(`${import.meta.env.VITE_API_URL}/users/all`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setUsers(res.data.users))
      .catch((err) => console.error("Error fetching users:", err));
  };

  useEffect(() => {
    if (projectId) {
      fetchProjectData();
      fetchUsers();
    }
  }, [projectId]);

  const handleSelect = (id) => {
    setSelectedUserIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleAddCollaborators = () => {
    if (!project || selectedUserIds.size === 0) return;

    const token = localStorage.getItem("token");
    console.log("Adding collaborators:", { projectId: project._id, userIds: Array.from(selectedUserIds) });

    axios
      .put(
        `${import.meta.env.VITE_API_URL}/projects/add-user`,
        {
          projectId: project._id,
          userIds: Array.from(selectedUserIds),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then((res) => {
        console.log("Collaborators added successfully:", res.data);
        fetchProjectData();
        setIsModalOpen(false);
        setSelectedUserIds(new Set());
      })
      .catch((err) => {
        console.error("Error adding collaborators:", err.response?.data || err.message);
        alert("Failed to add collaborators: " + (err.response?.data?.message || err.message));
      });
  };

  function send() {
    if (!message.trim()) return;

    sendMessage("project-message", {
      sender: user,
      message: message,
      createdAt: new Date(),
    });

    setMessages((prev) => [
      ...prev,
      { sender: user, message, createdAt: new Date() },
    ]);
    setMessage("");
  }

  function WriteAiMessage(message){

    function getText(obj) {
      if (typeof obj === 'string') return obj;
      if (obj && typeof obj === 'object' && obj.text) return getText(obj.text);
      return JSON.stringify(obj);
    }

    let text = getText(message);
    text = String(text); 

    return (

    <div className="overflow-x-auto bg-slate-700 text-white p-3 rounded-md">
      <Markdown>{text}</Markdown>
    </div>)
  }

  function appendIncomingMessage(messageObject) {
    console.log("Received message:", messageObject);
    if (messageObject.sender?._id === user._id) {
      console.log("Ignoring own message");
      return; 
    }
    console.log("Adding message to state");
    setMessages((prev) => [...prev, messageObject]);
  }

  useEffect(() => {
    if (messageBoxRef.current) {
      messageBoxRef.current.scrollTop = messageBoxRef.current.scrollHeight;
    } 
  }, [messages]);

  if (!project) {
    return <p className="p-6">Loading project...</p>;
  }

  function saveFileTree(ft){
    axios.put('/projects/update-file-tree', {
      projectId: project._id,
      fileTree: ft
    }).then(res => {
      console.log(res.data)
    }).catch(err => {
      console.log(err)
    })
  }

  return (
    <main className="bg-gray-50 min-h-screen h-screen w-screen flex">

      <section className="relative left h-full min-w-[380px] max-w-[380px] bg-white border-r border-gray-200 shadow-sm flex flex-col">

        <header className="bg-gray-50 border-b border-gray-200 p-4 rounded-t-lg flex justify-between items-center">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex gap-2 items-center hover:bg-gray-100 p-2 rounded-lg transition-colors"
          >
            <i className="ri-add-fill text-gray-600"></i>
            <p className="text-gray-700 font-medium">Add collaborator</p>
          </button>
          <button
            onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}
            className="p-2 cursor-pointer hover:bg-gray-100 rounded-lg transition-colors"
          >
            <i className="ri-group-fill text-gray-600"></i>
          </button>
        </header>


        <div
          ref={messageBoxRef}
          className="conversation-area flex-grow flex flex-col gap-3 p-4 overflow-y-auto bg-gray-50"
        >
          {messages.map((msg, index) => (
            <div
              key={msg.createdAt || index}
              className={`max-w-[70%] p-3 rounded-lg shadow-sm ${
                msg.sender?._id === user._id
                  ? "ml-auto bg-blue-100 border-l-4 border-blue-500"
                  : "bg-white border-l-4 border-gray-300"
              }`}
            >
              {msg.sender?._id === "ai" ? (
                <>
                  <small className="opacity-70 text-xs block mb-2 text-gray-600">AI Assistant</small>
                  {WriteAiMessage(msg.message)}
                </>
              ) : (
                <>
                  <small className="opacity-70 text-xs block mb-2 text-gray-600">{msg.sender?.email}</small>
                  <p className="text-sm text-gray-800">{msg.message}</p>
                  <small className="text-xs text-gray-400 mt-1 block">{new Date(msg.createdAt).toLocaleTimeString()}</small>
                </>
              )}
            </div>
          ))}
        </div>


        <div className="inputField w-full flex border-t bg-white border-gray-200 rounded-b-lg p-3 shadow-sm">
          <input
            className="p-2 px-4 border-none outline-none flex-grow bg-transparent"
            type="text"
            placeholder="Enter message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
          />
          <button
            onClick={send}
            className="px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <i className="ri-send-plane-fill"></i>
          </button>
        </div>


        <div
          className={`sidePanel w-full h-full flex flex-col gap-3 bg-white shadow-lg backdrop-blur-sm absolute transition-transform duration-300 ${
            isSidePanelOpen ? "translate-x-0" : "-translate-x-full"
          } top-0 z-40`}
        >
          <header className="flex justify-between items-center p-4 bg-gray-50 border-b border-gray-200 rounded-t-lg">
            <h1 className="text-xl font-semibold text-gray-900">Collaborators</h1>
            <button
              onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}
              className="p-2 cursor-pointer hover:bg-gray-100 rounded-lg transition-colors"
            >
              <i className="ri-close-fill text-gray-600"></i>
            </button>
          </header>

          <div className="users flex flex-col gap-2 p-4 overflow-y-auto">
            {project?.users?.map((user) => (
              <div
                key={user._id}
                className="user hover:bg-gray-50 p-3 rounded-lg transition-colors flex gap-3 items-center cursor-pointer"
              >
                <div className="aspect-square rounded-full bg-blue-100 w-10 h-10 flex items-center justify-center">
                  <i className="ri-user-fill text-blue-600 text-sm"></i>
                </div>
                <div>
                  <h1 className="font-semibold text-gray-900 text-sm">{user.email}</h1>
                  <p className="text-xs text-gray-500">Active</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      <section className="right flex-grow h-full flex bg-gray-50">
        <div className="explorer h-full max-w-64 min-w-52 bg-white border-r border-gray-200 shadow-sm rounded-l-lg">
            <div className="file-tree w-full">
              {
                Object.keys(fileTree || {}).map((file) => (
                <div key={file} className="flex items-center justify-between p-1">
                  <button
                  onClick={() => {
                    setCurrentFile(file)
                    setOpenFiles((prevOpenFiles) => {
                      if (prevOpenFiles.includes(file)) {
                        return prevOpenFiles;
                      } else {
                        return [...prevOpenFiles, file];
                      }
                    });
                  }}
                  className="tree-element cursor-pointer p-3 px-4 flex items-center gap-2 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors flex-grow w-full text-left">
                    <i className="ri-file-line text-gray-500 text-sm"></i>
                    <p className="font-medium text-gray-700 text-sm">{file}</p>
                  </button>
                  <i className="ri-close-fill cursor-pointer p-2 hover:text-red-500 text-gray-400 transition-colors" onClick={(e) => {
                    e.stopPropagation();
                    setFileTree(prev => {
                      const newTree = { ...prev };
                      delete newTree[file];
                      return newTree;
                    });
                    setOpenFiles(prev => prev.filter(f => f !== file));
                    if (currentFile === file) {
                      setCurrentFile(null);
                    }
                  }}></i>
                </div>
                ))
              }

            </div>
        </div>


        <div className="code-editor flex flex-col flex-grow h-full bg-gray-50">
          <div className="top bg-gray-100 rounded-t-lg flex justify-between p-2">
            <div className="files flex gap-1">
            {
              openFiles.map((file) => (
                <button key={file} onClick={() => setCurrentFile(file)} className={`open-file cursor-pointer p-2 px-3 flex items-center gap-2 rounded-md transition-all ${currentFile === file ? 'bg-blue-500 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                  <p className="text-xs font-medium">{file}</p>
                  <i className="ri-close-fill cursor-pointer hover:text-red-400 text-xs" onClick={(e) => {
                    e.stopPropagation();
                    setOpenFiles(prev => prev.filter(f => f !== file));
                    setFileTree(prev => {
                      const newTree = { ...prev };
                      delete newTree[file];
                      return newTree;
                    });
                    if (currentFile === file) {
                      setCurrentFile(null);
                    }
                  }}></i>
                </button>
              ))
            }
          </div>

          <div className="actions flex gap-2">
            <button disabled={!(fileTree && Object.keys(fileTree).length > 0)} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed" onClick={async () => {
              if (!webContainer) {
                console.log('WebContainer not ready');
                return;
              }

              await webContainer.mount(fileTree)

              const installProcess = await webContainer.spawn("npm", ["install"])

              installProcess.output.pipeTo(new WritableStream({
                write(chunk){
                  console.log(chunk)
                }
              }))

              await installProcess.exit

              if(runProcess){
                runProcess.kill()
              }

              let tempRunProcess  = await webContainer.spawn("npm", ["start"])

              const outputStream = new WritableStream({
                write(chunk) {
                  const message = new TextDecoder().decode(chunk);
                  console.log(message);
                  // Parse for server URL, e.g., "Local: http://localhost:3000/"
                  const urlMatch = message.match(/Local:\s+(http:\/\/localhost:\d+)/);
                  if (urlMatch) {
                    const detectedUrl = urlMatch[1];
                    setIFrameUrl(detectedUrl);
                  }
                }
              });

              tempRunProcess.output.pipeTo(outputStream)

              setRunProcess(tempRunProcess)
            }}>
              <i className="ri-play-fill mr-1"></i>
              Run
            </button>
          </div>

        </div>
            <div className="bottom flex flex-grow bg-gray-900 rounded-b-lg shadow-inner">
              {
                fileTree?.[currentFile] && (
                  <Editor
                    height="100%"
                    width="100%"
                    theme="vs-dark"
                    language={getLanguage(currentFile)}
                    value={fileTree?.[currentFile]?.content || ''}
                    onChange={(value) => {
                      setFileTree({
                        ...fileTree,
                        [currentFile]: {
                          content: value || '',
                        },
                      });
                    }}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      wordWrap: 'on',
                      automaticLayout: true,
                    }}
                  />
                )
              }
            </div>
        </div>

        {iFrameUrl && webContainer &&
        <div className="flex min-w-96 flex-col h-full bg-white border-l border-gray-200 shadow-sm rounded-r-lg">
          <div className="address-bar bg-gray-50 rounded-t-lg p-2 border-b border-gray-200">
            <input type="text" 
            onChange={(e) => setIFrameUrl(e.target.value)}
            value={iFrameUrl} className="w-full p-2 px-3 border border-gray-300 rounded-md bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors" />
          </div>
          <iframe src={iFrameUrl} className="w-full h-full rounded-b-lg"></iframe>
        </div>
        }



      </section>


      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-11/12 max-w-md p-6 relative">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Select Users</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-full"
              >
                <i className="ri-close-line"></i>
              </button>
            </div>


            {selectedUserIds.size > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {[...selectedUserIds].map((id) => {
                  const user = users.find((u) => u._id === id);
                  return (
                    <span
                      key={id}
                      className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm shadow-sm"
                    >
                      {user?.name || "Unknown"}
                      <button
                        onClick={() => handleSelect(id)}
                        className="ml-1 text-red-500 hover:text-red-700 transition-colors"
                      >
                        <i className="ri-close-fill text-xs"></i>
                      </button>
                    </span>
                  );
                })}
              </div>
            )}


            <div className="max-h-60 overflow-y-auto space-y-2 pb-16">
              {users.map((user) => (
                <div
                  key={user._id}
                  onClick={() => handleSelect(user._id)}
                  className={`cursor-pointer p-3 rounded-lg border transition-all duration-200 flex justify-between items-center hover:shadow-sm ${
                    selectedUserIds.has(user._id)
                      ? "bg-blue-50 border-blue-200 text-blue-800"
                      : "bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-800"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="aspect-square rounded-full bg-gray-200 w-8 h-8 flex items-center justify-center">
                      <i className="ri-user-line text-gray-600 text-sm"></i>
                    </div>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  {selectedUserIds.has(user._id) && (
                    <i className="ri-check-fill text-lg text-blue-500"></i>
                  )}
                </div>
              ))}
            </div>


            <div className="absolute bottom-4 left-0 w-full flex justify-center">
              <button
                onClick={handleAddCollaborators}
                disabled={selectedUserIds.size === 0}
                className={`px-6 py-2 font-semibold rounded-lg shadow-md transition-all duration-200 ${
                  selectedUserIds.size > 0
                    ? "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg transform hover:-translate-y-0.5"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                Add Collaborators
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Project;