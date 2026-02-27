import torch
import torch.nn as nn
import torch.nn.functional as F

class TemporalSkeletonEncoder(nn.Module):
    def __init__(self, num_joints=17, joint_dim=2, hidden_dim=256, embedding_dim=128):
        super().__init__()
        input_dim = num_joints * joint_dim
        
        self.lstm = nn.LSTM(
            input_size=input_dim,
            hidden_size=hidden_dim,
            num_layers=2,
            batch_first=True,
            dropout=0.2,
            bidirectional=True
        )
        
        self.attention = nn.Sequential(
            nn.Linear(hidden_dim * 2, 64),
            nn.Tanh(),
            nn.Linear(64, 1)
        )
        
        self.fc = nn.Sequential(
            nn.Linear(hidden_dim * 2, 256),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(256, embedding_dim)
        )
        
    def forward(self, x):
        batch_size, seq_len = x.shape[0], x.shape[1]
        x = x.reshape(batch_size, seq_len, -1)
        lstm_out, _ = self.lstm(x)
        attention_weights = self.attention(lstm_out)
        attention_weights = F.softmax(attention_weights, dim=1)
        context = torch.sum(lstm_out * attention_weights, dim=1)
        embedding = self.fc(context)
        embedding = F.normalize(embedding, p=2, dim=1)
        return embedding